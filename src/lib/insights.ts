import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface Insight {
  id?: string;
  title: string;
  content: string;
  author: string;
  featuredImage: string;
  publishedAt: string;
  status: 'draft' | 'published';
}

export async function getPublishedInsights(): Promise<Insight[]> {
  const q = query(
    collection(db, 'insights'),
    where('status', '==', 'published'),
    orderBy('publishedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Insight));
}

export async function getAllInsights(): Promise<Insight[]> {
  const q = query(collection(db, 'insights'), orderBy('publishedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Insight));
}

export async function getInsightById(id: string): Promise<Insight | null> {
  const docRef = doc(db, 'insights', id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Insight;
  }
  return null;
}

export async function createInsight(insight: Omit<Insight, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'insights'), insight);
  return docRef.id;
}

export async function updateInsight(id: string, insight: Partial<Insight>): Promise<void> {
  const docRef = doc(db, 'insights', id);
  await updateDoc(docRef, insight);
}

export async function deleteInsight(id: string): Promise<void> {
  const docRef = doc(db, 'insights', id);
  await deleteDoc(docRef);
}

export async function seedInitialInsights() {
  const existing = await getAllInsights();
  if (existing.length > 0) return;

  const insights: Omit<Insight, 'id'>[] = [
    {
      title: "Best cloud migration strategy for Atlanta healthcare clinics",
      content: "Healthcare clinics in Atlanta face unique challenges when migrating to the cloud. Ensuring HIPAA compliance, minimizing downtime, and protecting sensitive patient data are paramount.\n\n### 1. Assess Your Current Infrastructure\nBefore moving anything, take a complete inventory of your servers, applications, and data. Identify which systems handle Protected Health Information (PHI).\n\n### 2. Choose a HIPAA-Compliant Cloud Provider\nNot all cloud providers are created equal. Ensure your provider offers a Business Associate Agreement (BAA) and has robust security measures in place.\n\n### 3. Plan for Minimal Downtime\nMigrate in phases. Start with non-critical systems to test the waters before moving your Electronic Health Records (EHR) system.\n\n### 4. Train Your Staff\nA new system is only as good as the people using it. Provide comprehensive training to ensure your staff understands the new workflows and security protocols.\n\nAt Brown's IT Solutions, we specialize in seamless, secure cloud migrations for healthcare providers. Contact us today to learn more.",
      author: "Tony Brown",
      featuredImage: "https://picsum.photos/seed/cloud-healthcare/800/400",
      publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: "published"
    },
    {
      title: "HIPAA compliant IT support in Georgia",
      content: "For medical practices in Georgia, HIPAA compliance isn't just a suggestion—it's the law. Failing to protect patient data can result in massive fines and a ruined reputation.\n\n### What Does HIPAA Compliant IT Look Like?\n\n*   **Data Encryption:** All PHI must be encrypted both in transit and at rest.\n*   **Access Controls:** Strict role-based access ensures only authorized personnel can view sensitive data.\n*   **Audit Logs:** You must be able to track who accessed what data and when.\n*   **Regular Risk Assessments:** Continuous monitoring and vulnerability scanning are required to identify and fix security gaps.\n\n### Why You Need a Specialized IT Partner\nGeneric IT support isn't enough. You need a partner who understands the intricacies of HIPAA regulations and can proactively secure your network.\n\nBrown's IT Solutions provides comprehensive, HIPAA-compliant IT support for medical practices across Georgia. We handle the technology so you can focus on patient care.",
      author: "Tony Brown",
      featuredImage: "https://picsum.photos/seed/hipaa-security/800/400",
      publishedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      status: "published"
    },
    {
      title: "What to do when a server crashes in the middle of the workday",
      content: "A server crash during peak business hours is a nightmare scenario. Productivity grinds to a halt, customers get frustrated, and revenue is lost. Here is what you need to do immediately.\n\n### 1. Don't Panic, Communicate\nImmediately inform your team about the outage. Transparency prevents confusion and allows staff to switch to offline tasks if possible.\n\n### 2. Contact Your IT Support\nIf you have an IT partner like Brown's IT Solutions, call them immediately. The faster they know, the faster they can start diagnosing the issue.\n\n### 3. Check the Basics\nIs it a power issue? Did a cable get unplugged? Sometimes the simplest explanation is the correct one.\n\n### 4. Initiate Your Disaster Recovery Plan\nIf the server is truly down, it's time to failover to your backup systems. This is why having a robust Backup & Recovery solution is critical.\n\n### 5. Post-Mortem\nOnce the server is back online, work with your IT team to determine the root cause and implement measures to prevent it from happening again.\n\nDon't wait for a crash to realize you need better IT support. Contact Brown's IT Solutions to bulletproof your infrastructure.",
      author: "Tony Brown",
      featuredImage: "https://picsum.photos/seed/server-crash/800/400",
      publishedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      status: "published"
    }
  ];

  for (const insight of insights) {
    await createInsight(insight);
  }
}
