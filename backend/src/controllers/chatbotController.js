import { db } from '../data/store.js';

/**
 * Temple Knowledge Assistant / Chatbot
 * Answers pilgrim questions grounded in real temple data.
 * POST /api/chatbot/ask
 */
export const askAssistant = async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ success: false, message: 'Question text is required.' });
    }

    const q = question.toLowerCase().trim();
    const settings = db.data.settings;
    const areas = db.data.templeAreas;
    const festivals = db.data.festivals.filter(f => f.status === 'ACTIVE');

    let answer = '';
    let category = 'GENERAL';

    if (q.includes('time') || q.includes('timing') || q.includes('open') || q.includes('close') || q.includes('hour')) {
      category = 'TIMINGS';
      answer = `Temple gates open daily at ${settings.darshanOpenTime || '05:00 AM'} and close at ${settings.darshanCloseTime || '10:30 PM'}. Morning Suprabhata ritual commences at 05:30 AM, and evening Maha Aarti is conducted at 07:00 PM.`;
    } else if (q.includes('book') || q.includes('reserve') || q.includes('ticket') || q.includes('slot')) {
      category = 'BOOKING';
      answer = `You can book a Darshan slot directly through the "Book Darshan" section. Choose your preferred date, select the darshan category (General, Special Quick Darshan, or Senior Citizen), pick a 2-hour time slot, enter pilgrim details, and generate your digital QR token immediately.`;
    } else if (q.includes('cancel') || q.includes('refund')) {
      category = 'CANCELLATION';
      answer = `To cancel your booking, go to "My Bookings" in your pilgrim dashboard and click "Cancel Booking" next to your active booking. Free cancellation is permitted before entry check-in.`;
    } else if (q.includes('park') || q.includes('car') || q.includes('vehicle')) {
      const parkArea = areas.find(a => a.code === 'PARKING_AREA') || { currentCount: 190, capacity: 300, crowdLevel: 'MODERATE' };
      category = 'PARKING';
      answer = `Dedicated vehicle parking is available in the North & South Parking Lots. Current occupancy is ${parkArea.currentCount}/${parkArea.capacity} spaces (${parkArea.crowdLevel} crowd level). Entry fee is nominal with automated barrier control.`;
    } else if (q.includes('rule') || q.includes('dress') || q.includes('cloth') || q.includes('guideline')) {
      category = 'RULES';
      answer = `Temple Dress Code & Rules: Traditional Indian attire is recommended (Dhoti/Kurta for men; Saree/Salwar Kameez for women). Footwear must be deposited at the free shoe counter near the entrance. Electronic items and cameras are strictly prohibited inside the inner sanctum.`;
    } else if (q.includes('prasadam') || q.includes('food') || q.includes('laddu') || q.includes('annadanam')) {
      const prasadArea = areas.find(a => a.code === 'PRASADAM_AREA') || { currentCount: 95, capacity: 200, crowdLevel: 'LOW' };
      category = 'PRASADAM';
      answer = `Holy Laddu Prasadam is distributed at Counter 4. Free Annadanam (sacred meal) is served daily from 11:30 AM to 03:00 PM and 07:30 PM to 09:30 PM in the Annapurna Hall. Current prasadam queue crowd is ${prasadArea.crowdLevel}.`;
    } else if (q.includes('crowd') || q.includes('rush') || q.includes('busy')) {
      const totalVisitors = areas.reduce((acc, a) => acc + a.currentCount, 0);
      category = 'CROWD';
      answer = `Current total estimated crowd inside the temple complex is ${totalVisitors} pilgrims. Queue bays are moving steadily with an estimated wait time of 15-25 minutes. You can check the real-time zone map under the "Crowd Status" tab.`;
    } else if (q.includes('emergency') || q.includes('help') || q.includes('lost') || q.includes('doctor') || q.includes('medical')) {
      category = 'EMERGENCY';
      answer = `For immediate help on temple grounds, use the "Emergency SOS" button in the menu or contact our 24/7 Helpline at ${settings.helplinePhone || '+91 98765 43210'}. First-aid medical posts are stationed at the Main Entrance and Darshan Hall exit.`;
    } else if (q.includes('festival') || q.includes('event') || q.includes('special')) {
      category = 'FESTIVAL';
      if (festivals.length > 0) {
        const fest = festivals[0];
        answer = `Current Festival: ${fest.name} (Dates: ${fest.startDate} to ${fest.endDate}). Extended darshan hours: ${fest.extendedDarshanHours}. ${fest.specialAnnouncement || ''}`;
      } else {
        answer = `No active festival schedules today. Standard daily rituals and regular darshan slots are operating normally.`;
      }
    } else {
      answer = `I am the Temple Information Assistant. You can ask me about darshan timings, online booking procedures, dress code rules, parking availability, prasadam timings, live crowd status, or emergency help desk contacts.`;
    }

    res.json({
      success: true,
      category,
      question,
      answer
    });
  } catch (err) {
    next(err);
  }
};
