// -------------------- DOM Elements --------------------
const form = document.getElementById("reportForm");
const patientNameInput = document.getElementById("patientName");
const categoryInput = document.getElementById("category");
const hospitalInput = document.getElementById("hospital");
const reportFileInput = document.getElementById("reportFile");
const reportsContainer = document.getElementById("reportsList");
const scanBtn = document.getElementById("scanBtn");
const ocrBtn = document.getElementById("ocrBtn");
const readerDiv = document.getElementById("reader");

let reports = [];
let editId = null; // Track report being edited
const API_BASE_URL = "http://localhost:5000/api/reports";

// -------------------- Load Reports --------------------
async function loadReports() {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) throw new Error("Failed to load reports");

    reports = await response.json();
    displayReports(reports);
  } catch (error) {
    console.error("Error loading reports:", error);
    reportsContainer.innerHTML = "<p>Failed to load reports.</p>";
  }
}

// -------------------- Display Reports --------------------
function displayReports(reportsList) {
  reportsContainer.innerHTML = "";

  if (reportsList.length === 0) {
    reportsContainer.innerHTML = "<p>No reports found.</p>";
    return;
  }

  reportsList.forEach(report => {
    const reportElement = document.createElement("div");
    reportElement.className = "report-card";

    reportElement.innerHTML = `
      <h3>${report.patientName}</h3>
      <p><strong>Category:</strong> ${report.category}</p>
      <p><strong>Hospital:</strong> ${report.hospital}</p>
      ${report.file ? `<a href="${report.file}" target="_blank">View File</a>` : ""}
      <button onclick="editReport(${report.id})" class="edit-btn">Edit</button>
      <button onclick="deleteReport(${report.id})" class="delete-btn">Delete</button>
    `;

    reportsContainer.appendChild(reportElement);
  });
}

// -------------------- Add / Update Report --------------------
async function handleFormSubmit(event) {
  event.preventDefault();

  try {
    const formData = new FormData();
    formData.append("patientName", patientNameInput.value.trim());
    formData.append("category", categoryInput.value.trim());
    formData.append("hospital", hospitalInput.value.trim());

    if (reportFileInput.files.length > 0) {
      formData.append("file", reportFileInput.files[0]);
    }

    let response;
    if (editId) {
      // Update existing report
      response = await fetch(`${API_BASE_URL}/${editId}`, {
        method: "PUT",
        body: formData
      });
    } else {
      // Add new report
      response = await fetch(API_BASE_URL, {
        method: "POST",
        body: formData
      });
    }

    if (!response.ok) throw new Error("Failed to save report");

    const result = await response.json();
    console.log(editId ? "Report updated:" : "Report added:", result);

    form.reset();
    editId = null;
    form.querySelector("button[type='submit']").textContent = "Add Report";

    await loadReports();
  } catch (error) {
    console.error("Error saving report:", error);
    alert("Failed to save report. Check console for details.");
  }
}

// -------------------- Delete Report --------------------
async function deleteReport(id) {
  if (!confirm("Are you sure you want to delete this report?")) return;

  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete report");

    console.log(`Report ${id} deleted`);
    await loadReports();
  } catch (error) {
    console.error("Error deleting report:", error);
    alert("Failed to delete report. Check console for details.");
  }
}

// -------------------- Edit Report --------------------
function editReport(id) {
  const report = reports.find(r => r.id === id);
  if (!report) return;

  patientNameInput.value = report.patientName;
  categoryInput.value = report.category;
  hospitalInput.value = report.hospital;
  editId = id;

  form.querySelector("button[type='submit']").textContent = "Update Report";
}

// -------------------- QR Scanner --------------------
scanBtn.addEventListener("click", () => {
  readerDiv.style.display = "block";
  const html5QrCode = new Html5Qrcode("reader");

  Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
      html5QrCode.start(
        devices[0].id,
        { fps: 10, qrbox: 250 },
        decodedText => {
          const [name, hospital, category] = decodedText.split("|");
          patientNameInput.value = name || "";
          hospitalInput.value = hospital || "";
          categoryInput.value = category || "";
          html5QrCode.stop();
          readerDiv.style.display = "none";
        },
        err => console.warn("QR scan error:", err)
      );
    } else {
      alert("No camera found!");
    }
  }).catch(err => console.error("Camera error:", err));
});

// -------------------- OCR --------------------
ocrBtn.addEventListener("click", () => {
  if (!reportFileInput.files[0]) {
    alert("Please choose an image/PDF first");
    return;
  }

  Tesseract.recognize(
    reportFileInput.files[0],
    "eng",
    { logger: m => console.log(m) }
  ).then(({ data: { text } }) => {
    console.log("OCR Result:", text);

    const lines = text.split("\n").map(l => l.trim());
    const patientLine = lines.find(l => l.toLowerCase().includes("patient"));
    const hospitalLine = lines.find(l => l.toLowerCase().includes("hospital"));

    if (patientLine) patientNameInput.value = patientLine.split(":")[1]?.trim() || "";
    if (hospitalLine) hospitalInput.value = hospitalLine.split(":")[1]?.trim() || "";
  });
});

// -------------------- Event Listeners --------------------
form.addEventListener("submit", handleFormSubmit);

// -------------------- Initial Load --------------------
loadReports();
