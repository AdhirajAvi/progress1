const profileNameInput = document.getElementById("profileName");
const profileEmailInput = document.getElementById("profileEmail");
const profilePhoneInput = document.getElementById("profilePhone");
const profilePicInput = document.getElementById("profilePicInput");
const profilePicPreview = document.getElementById("profilePicPreview");
const saveProfileBtn = document.getElementById("saveProfileBtn");

// Load profile from backend API
async function loadProfile() {
  try {
    const response = await fetch("http://localhost:5000/api/profile");
    if (!response.ok) throw new Error("Failed to load profile");

    const profile = await response.json();
    profileNameInput.value = profile.name || "";
    profileEmailInput.value = profile.email || "";
    profilePhoneInput.value = profile.phone || "";
    profilePicPreview.src = profile.avatar || "https://via.placeholder.com/120";
  } catch (error) {
    console.error("Error loading profile:", error);
  }
}

// Preview selected profile image
profilePicInput.addEventListener("change", () => {
  const file = profilePicInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      profilePicPreview.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Save profile
saveProfileBtn.addEventListener("click", async () => {
  try {
    const formData = new FormData();
    formData.append("name", profileNameInput.value.trim());
    formData.append("email", profileEmailInput.value.trim());
    formData.append("phone", profilePhoneInput.value.trim());
    if (profilePicInput.files[0]) formData.append("avatar", profilePicInput.files[0]);

    const response = await fetch("http://localhost:5000/api/profile", {
      method: "PUT",
      body: formData
    });

    if (!response.ok) throw new Error("Failed to save profile");

    const result = await response.json();
    console.log("Profile saved:", result);
    alert("Profile updated successfully!");
  } catch (error) {
    console.error("Error saving profile:", error);
    alert("Failed to save profile. Check console for details.");
  }
});

// Initial load
loadProfile();
