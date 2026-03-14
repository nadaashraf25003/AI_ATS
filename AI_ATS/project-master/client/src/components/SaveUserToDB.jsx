import { useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { useEffect } from "react";

function SaveUserToDB() {
  const { user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const saveUser = async () => {
      try {
        // لو المستخدم لسه مش جاهز (لسه بيعمل لوجين)
        if (!user) return;

        // ناخد التوكن من Clerk
        const token = await getToken();

        // نبعت بيانات المستخدم للسيرفر
        await axios.post(
          "http://localhost:5001/api/users/save",
          {
            clerkId: user.id,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            email: user.primaryEmailAddress?.emailAddress,
            image: user.imageUrl,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("✅ User synced successfully with MongoDB");
      } catch (error) {
        console.error("❌ Error syncing user:", error);
      }
    };

    saveUser();
  }, [user]);

  return null; // مش بيرجع واجهة، بس بيشتغل أوتوماتيك أول ما المستخدم يدخل
}

export default SaveUserToDB;
