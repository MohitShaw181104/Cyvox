import { VoiceUpload } from "@/components/voice-upload";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPincodeDetails } from "@/lib/pincode";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { Spinner } from "@/components/ui/spinner";

export function ComplaintFormPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // Step state for multi-step form
  const [formData, setFormData] = useState({
    userVoice: null as File | null,
    scamCall: null as File | null,
    name: "",
    userPhoneNumber: "",
    scammerPhoneNumber: "",
    pincode: "",
    city: "",
    state: "",
    district: "",
    street: "",
    subject: "",
    description: "",
    callFrequency: 1,
    date: undefined as Date | undefined,
    moneyScammed: "",
  });

  // Autofill name and phone from Clerk on mount/update
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.fullName || user.username || user.firstName || "",
        userPhoneNumber:
          user.phoneNumbers[0]?.phoneNumber?.replace(/\D/g, "") || "",
      }));
    }
  }, [user]);

  const handleUserVoiceUpload = (file: File) => {
    setFormData((prev) => ({ ...prev, userVoice: file }));
  };

  const handleScamCallUpload = (file: File) => {
    setFormData((prev) => ({ ...prev, scamCall: file }));
  };

  const handlePincodeChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const pincode = e.target.value;
    setFormData((prev) => ({ ...prev, pincode }));

    if (pincode.length === 6) {
      setIsLoading(true);
      try {
        const details = await getPincodeDetails(pincode);
        if (details) {
          setFormData((prev) => ({
            ...prev,
            city: details.city,
            district: details.district,
            state: details.state,
          }));
        } else {
          toast({
            title: "Invalid Pincode",
            description: "Could not find location details for this pincode",
            variant: "destructive",
          });
          setFormData((prev) => ({
            ...prev,
            city: "",
            district: "",
            state: "",
          }));
        }
      } catch {
        toast({
          title: "Error",
          description: "Failed to fetch location details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setFormData((prev) => ({ ...prev, city: "", district: "", state: "" }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "callFrequency" ? Number(value) : value,
    }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate required fields for step 1
    if (
      !formData.name ||
      !formData.userPhoneNumber ||
      !formData.pincode ||
      !formData.city ||
      !formData.state ||
      !formData.district ||
      !formData.street ||
      !formData.userVoice
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields in this step",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.scammerPhoneNumber ||
      !formData.scamCall ||
      !formData.subject ||
      !formData.description ||
      !formData.moneyScammed
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Fetch userId from backend using clerkUserId
      let userId = "";
      try {
        const userRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/user/clerkId/${user?.id}`
        );
        userId = userRes.data?.["User Found"]?._id || "";
        if (!userId) throw new Error("User not found");
      } catch (err: any) {
        toast({
          title: "Error",
          description: err?.response?.data?.detail?.error || err.message || "Failed to fetch user ID",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const data = new FormData();
      data.append("username", formData.name);
      data.append("userId", userId);
      data.append("clerkUserId", user?.id || "");
      data.append("email", user?.emailAddresses[0]?.emailAddress || "");
      data.append("userPhoneNumber", formData.userPhoneNumber);
      data.append("scammerPhoneNumber", formData.scammerPhoneNumber);
      data.append("callFrequency", String(formData.callFrequency));
      if (formData.userVoice)
        data.append("userSampleAudio", formData.userVoice);
      data.append("userConversationAudio", formData.scamCall);
      data.append("city", formData.city);
      data.append("district", formData.district);
      data.append("state", formData.state);
      data.append("pincode", formData.pincode);
      data.append("streetAddress", formData.street);
      data.append("complainSubject", formData.subject);
      data.append("incidentDescription", formData.description);
      data.append("moneyScammed", formData.moneyScammed);
      if (formData.date) {
  // Send as YYYY-MM-DD string
  const dateString = formData.date instanceof Date
    ? formData.date.toISOString().split('T')[0]
    : formData.date;
  data.append("dateOfIncident", dateString);
}
      console.log("Submitting complaint with data:", {
        username: formData.name,
        userId,
        clerkUserId: user?.id,
        email: user?.emailAddresses[0]?.emailAddress,
        userPhoneNumber: formData.userPhoneNumber,
        scammerPhoneNumber: formData.scammerPhoneNumber,
        callFrequency: formData.callFrequency,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        streetAddress: formData.street,
        complainSubject: formData.subject,
        incidentDescription: formData.description,
        moneyScammed: formData.moneyScammed,
        scammercall: formData.scamCall
          ? formData.scamCall.name
          : "No file uploaded",
        userVoice: formData.userVoice
          ? formData.userVoice.name
          : "No file uploaded",
      });
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/complaint/register`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Save the response
        const { email, ["complaint details"]: complaintDetails } = response.data;
        const complaintId = complaintDetails?._id;
        const username = complaintDetails?.username;

        // Send confirmation email
        if (email && username && complaintId) {
          await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/mail`,
            new URLSearchParams({
              email,
              username,
              complaint_id: complaintId,
            }),
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          );
        }

        console.log("Response status:", response.status);

        toast({
          title: "Success",
          description:
            "Your complaint has been submitted successfully. Redirecting to records...",
        });
      } catch (error: any) {
        const message =
          error.response?.data?.detail || "Failed to submit complaint";
        console.error("Error submitting complaint:", message);

        toast({
          title: "Error",
          description: message,
        });
      }

      setTimeout(() => {
        navigate("/records");
      }, 1000);

      setFormData({
        userVoice: null,
        scamCall: null,
        name: user?.fullName || user?.username || user?.firstName || "",
        userPhoneNumber:
          user?.phoneNumbers[0]?.phoneNumber?.replace(/\D/g, "") || "",
        scammerPhoneNumber: "",
        pincode: "",
        city: "",
        state: "",
        district: "",
        street: "",
        subject: "",
        description: "",
        callFrequency: 1,
        date: undefined,
        moneyScammed: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit complaint",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-2xl mx-auto relative">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <Spinner className="h-16 w-16 text-primary" />
        </div>
      )}
      <Card className={isLoading ? "p-6 pointer-events-none select-none blur-sm" : "p-6"}>
        <h1 className="text-3xl font-bold mb-6 text-center">
          Register Your Complaint
        </h1>
        <form
          onSubmit={step === 1 ? handleNext : handleSubmit}
          className="space-y-0 flex flex-col items-center"
        >
          {step === 1 && (
            <>
              {/* User Name (auto-filled, editable) */}
              <div className="space-y-2 w-full flex flex-col items-center py-3">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                  className="max-w-md text-center"
                />
              </div>
              {/* User Phone Number (auto-filled, editable) */}
              <div className="space-y-2 w-full flex flex-col items-center py-3">
                <Label htmlFor="userPhoneNumber">Your Phone Number</Label>
                <Input
                  id="userPhoneNumber"
                  name="userPhoneNumber"
                  value={formData.userPhoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  required
                  className="max-w-md text-center"
                />
              </div>
              {/* Address */}
              <div className="space-y-4 w-full flex flex-col items-center py-6">
                <Label>Address Details</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md w-full">
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handlePincodeChange}
                      placeholder="Enter pincode"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      className={`text-center ${isLoading ? "opacity-50" : ""}`}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder={isLoading ? "Loading..." : "City"}
                      required
                      className="text-center"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="District">District</Label>
                    <Input
                      id="District"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      placeholder={isLoading ? "Loading..." : "District"}
                      required
                      className="text-center"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder={isLoading ? "Loading..." : "State"}
                      required
                      className="text-center"
                    />
                  </div>
                </div>
                <div className="space-y-2 w-full max-w-md">
                  <Label htmlFor="street">Street Address</Label>
                  <Textarea
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="Enter your street address"
                    className="min-h-[80px] text-center"
                    required
                  />
                </div>
              </div>
              {/* Audio Uploads: User Voice */}
              <div className="space-y-2 w-full flex flex-col items-center py-3">
                <Label>Your Voice Recording (10 seconds)</Label>
                <div className="max-w-md w-full flex flex-col items-center">
                  <VoiceUpload onUploadComplete={handleUserVoiceUpload} />
                  {formData.userVoice && (
                    <p className="text-sm text-green-600 text-center mt-2">
                      Voice recording uploaded: {formData.userVoice.name}
                    </p>
                  )}
                </div>
              </div>
              <Button type="submit" className="w-32" disabled={isLoading}>
                Confirm
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              {/* Scammer Phone Number */}
              <div className="space-y-2 w-full flex flex-col items-center py-3">
                <Label htmlFor="scammerPhoneNumber">Scammer Phone Number</Label>
                <Input
                  id="scammerPhoneNumber"
                  name="scammerPhoneNumber"
                  value={formData.scammerPhoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter scammer's phone number"
                  required
                  className="max-w-md text-center"
                />
              </div>
              {/* Money Scammed */}
              <div className="space-y-2 w-full flex flex-col items-center py-3">
                <Label htmlFor="moneyScammed">Money Scammed (in INR)</Label>
                <Input
                  id="moneyScammed"
                  name="moneyScammed"
                  type="number"
                  min="0"
                  value={formData.moneyScammed}
                  onChange={handleInputChange}
                  placeholder="Enter amount scammed"
                  required
                  className="max-w-md text-center"
                />
              </div>
              {/* Audio Uploads: Scam Call */}
              <div className="space-y-2 w-full flex flex-col items-center py-3">
                <Label>Scam Call Recording</Label>
                <div className="max-w-md w-full flex flex-col items-center">
                  <VoiceUpload onUploadComplete={handleScamCallUpload} />
                  {formData.scamCall && (
                    <p className="text-sm text-green-600 text-center mt-2">
                      Scam call recording uploaded: {formData.scamCall.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2 w-full flex flex-col items-center py-3">
                <Label htmlFor="callFrequency">
                  How many times were you called?
                </Label>
                <Input
                  type="number"
                  id="callFrequency"
                  name="callFrequency"
                  value={formData.callFrequency}
                  onChange={handleInputChange}
                  placeholder="Enter number of scam calls"
                  className="max-w-md text-center"
                  required
                  min={1}
                />
              </div>
              <div className="space-y-2 w-full flex flex-col items-center py-3">
                <Label htmlFor="date">Date of Incident</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full max-w-md justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date
                        ? format(formData.date, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date: Date | undefined) =>
                        setFormData((prev) => ({ ...prev, date }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {/* Subject (moved to step 2) */}
              <div className="space-y-2 w-full flex flex-col items-center py-3">
                <Label htmlFor="subject">Subject of Complaint</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Enter the subject of your complaint"
                  className="max-w-md text-center"
                  required
                />
              </div>
              <div className="space-y-2 w-full flex flex-col items-center py-3">
                <Label htmlFor="description">Description of Incident</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Please describe the scam incident in detail"
                  className="min-h-[150px] max-w-md text-center"
                  required
                />
              </div>
              <div className="flex gap-4 w-full justify-center mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button type="submit" className="w-32" disabled={isLoading}>
                  Submit
                </Button>
              </div>
            </>
          )}
        </form>
      </Card>
    </div>
  );
}