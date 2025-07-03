import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useUser } from '@clerk/clerk-react';

export function RecordsPage() {
  const { user } = useUser();
  const clerkUserId = user?.id;
  const [userInfo, setUserInfo] = useState<any>(null);
  const [serverComplaints, setServerComplaints] = useState<{ complaint_id: string; complaint_date: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch complaints from backend
    const fetchServerComplaints = async () => {
      if (!clerkUserId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/clerkId/${clerkUserId}`);
        if (!res.ok) throw new Error('Failed to fetch server records');
        const data = await res.json();
        setUserInfo(data?.['User Found']);
        const prev = data?.['User Found']?.previousComplaints || [];
        setServerComplaints(prev);
      } catch (err) {

        setUserInfo(null);
        setServerComplaints([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServerComplaints();
  }, [clerkUserId]);

  return (
    <div className="container py-4 md:py-8 max-w-3xl mx-auto">
      <div className="space-y-4 md:space-y-6 flex flex-col items-center">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold">Past Records</h1>
          <p className="text-sm md:text-base text-muted-foreground">View your submitted complaints</p>
        </div>
        <div className="w-full space-y-3">
          {loading ? (
            <Card className="p-6 text-center">
              <p>Loading records...</p>
            </Card>
          ) : (
            <>
              {userInfo && (
                <Card className="p-4 mb-4">
                  <div className="flex flex-col gap-2">
                    <div><span className="font-semibold">User ID:</span> {userInfo._id}</div>
                    <div><span className="font-semibold">Username:</span> {userInfo.username}</div>
                    <div><span className="font-semibold">Email:</span> {userInfo.email}</div>
                    <div><span className="font-semibold">Phone Number:</span> {userInfo.phoneNumber}</div>
                    {/* <div><span className="font-semibold">Clerk User ID:</span> {userInfo.clerkUserId}</div> */}
                    <div><span className="font-semibold">Created At:</span> {new Date(userInfo.createdAt).toLocaleString()}</div>
                    <div><span className="font-semibold">Updated At:</span> {new Date(userInfo.updatedAt).toLocaleString()}</div>
                    {userInfo.audioUrl && (
                      <div className="mt-2">
                        <span className="font-semibold">Audio:</span>
                        <audio controls src={userInfo.audioUrl} className="w-full mt-1" />
                      </div>
                    )}
                  </div>
                </Card>
              )}
              <h2 className="text-lg font-semibold mt-2">Records</h2>
              {serverComplaints.length === 0 ? (
                <Card className="p-4 text-center">
                  <p className="text-muted-foreground">No records found.</p>
                </Card>
              ) : (
                serverComplaints.map((complaint) => (
                  <Card key={complaint.complaint_id} className="p-4 mb-2">
                    <div className="flex flex-col gap-2">
                      <div><span className="font-semibold">Complaint ID:</span> {complaint.complaint_id}</div>
                      <div><span className="font-semibold">Date:</span> {new Date(complaint.complaint_date).toLocaleString()}</div>
                    </div>
                  </Card>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}