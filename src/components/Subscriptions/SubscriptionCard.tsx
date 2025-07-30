import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../firebase';
import { Edit3, Trash2 } from 'lucide-react';
import EditSubscriptionModal from './EditSubscriptionModal';


interface Subscriptions {
    id: string;
    name:string;
    amount: number;
    category: string;
    date: string;
    note?: string;
    Frequency: string;

  }
  
  const SubscriptionsList: React.FC = () => {
    const [subscriptions, setSubscriptions] = useState<Subscriptions[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscriptions | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
  
    // Fetch expenses from Firestore
    useEffect(() => {
      const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        if (!user) {
          setSubscriptions([]);
          setLoading(false);
          return;
        }
  
        const q = query(
          collection(db, 'subscriptions'),
          where('userId', '==', user.uid),
          orderBy('date', 'desc')
        );
  
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Subscriptions[];
  
          setSubscriptions(data);
          setLoading(false);
        });
  
        return () => unsubscribeSnapshot();
      });
  
      return () => unsubscribeAuth();
    }, []);
  
    const handleDelete = async (id: string) => {
      try {
        await deleteDoc(doc(db, 'subscriptions', id));
      } catch (err) {
        console.error('Failed to delete expense:', err);
      }
    };
  
    const handleEdit = (subscriptions: Subscriptions) => {
      setSelectedSubscription(subscriptions);
      setIsEditOpen(true);
    };
  
    if (loading) return <p>Loading expenses...</p>;
    if (subscriptions.length === 0) return <p className="text-gray-500 mt-4">No expenses yet.</p>;
  
    return (
      <>
        <ul className="mt-4 flex flex-col gap-4">
          {subscriptions.map((Subscriptions) => (
            <li key={Subscriptions.id} className="bg-white rounded-xl shadow-md p-5 relative">
              {/* Top-right action buttons */}
              <div className="absolute top-4 right-4 flex gap-2 text-gray-400">
                <button
                  title="Edit"
                  className="hover:text-blue-600 transition"
                  onClick={() => handleEdit(Subscriptions)}
                >
                  <Edit3 size={18} />
                </button>
                <button
                  title="Delete"
                  className="hover:text-red-600 transition"
                  onClick={() => handleDelete(Subscriptions.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
  
              {/* Expense content */}
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-indigo-700">
                        {Subscriptions.name}
                  </p>
                  <p className="text-lg font-semibold text-indigo-700">
                        {Subscriptions.Frequency}
                  </p>
                  <p className="text-lg font-semibold text-indigo-700">
                    ${Subscriptions.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(Subscriptions.date).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-medium">Category:</span> {Subscriptions.category}
                </p>
                {Subscriptions.note && (
                  <p className="text-sm text-gray-500 italic mt-1">{Subscriptions.note}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
  
        {/* Edit Modal */}
        {isEditOpen && selectedSubscription && (
          <EditSubscriptionModal
            subscription={selectedSubscription}
            onClose={() => setIsEditOpen(false)}
          />
        )}
      </>
    );
  };
  
  export default SubscriptionsList;
  