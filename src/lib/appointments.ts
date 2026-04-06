import { collection, addDoc, getDocs, query, where, Timestamp, orderBy, doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export interface Appointment {
  id?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
}

export const bookAppointment = async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => {
  try {
    const docRef = await addDoc(collection(db, 'appointments'), {
      ...appointment,
      status: 'scheduled',
      createdAt: Timestamp.now()
    });
    
    // Save to public_slots to allow checking availability without exposing PII
    await setDoc(doc(db, 'public_slots', `${appointment.date}_${appointment.time}`), {
      date: appointment.date,
      time: appointment.time,
      status: 'scheduled'
    });

    // Trigger email notification via backend API
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment)
      });
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // We don't throw here because the appointment was successfully booked
    }

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'appointments');
  }
};

export const getAppointmentsByDate = async (date: string) => {
  try {
    const q = query(
      collection(db, 'public_slots'),
      where('date', '==', date),
      where('status', '==', 'scheduled')
    );
    const querySnapshot = await getDocs(q);
    const appointments: any[] = [];
    querySnapshot.forEach((doc) => {
      appointments.push(doc.data());
    });
    return appointments;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'public_slots');
    return [];
  }
};

export const getAllAppointments = async () => {
  try {
    const q = query(
      collection(db, 'appointments'),
      orderBy('date', 'desc'),
      orderBy('time', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const appointments: Appointment[] = [];
    querySnapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt.toDate() } as Appointment);
    });
    return appointments;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'appointments');
    return [];
  }
};

// Helper for Miriam to check availability
export const checkAvailability = async (date: string) => {
  const appointments = await getAppointmentsByDate(date);
  const bookedTimes = appointments.map(a => a.time);
  
  // Generate all possible slots
  const slots = [];
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getUTCDay(); // 0 is Sunday, 6 is Saturday
  
  if (dayOfWeek === 0) return []; // Closed on Sundays

  let startHour = 8;
  let startMin = 30;
  let endHour = 17;
  let endMin = 30;

  if (dayOfWeek === 6) {
    startHour = 9;
    startMin = 30;
    endHour = 14;
    endMin = 20;
  }

  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === startHour && m < startMin) continue;
      if (h === endHour && m > endMin) continue;
      
      const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      if (!bookedTimes.includes(timeString)) {
        slots.push(timeString);
      }
    }
  }

  return slots;
};
