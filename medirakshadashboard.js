// -------------------- Temporary In-memory storage --------------------
let reports = [];

// -------------------- Form Submit --------------------
document.getElementById("reportForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const patientName = document.getElementById("patientName").value.trim();
  const category = document.getElementById("category").value;
  const hospital = document.getElementById("hospital").value.trim();
  const fileInput = document.getElementById("reportFile");

  if (!patientName || !category || !hospital) {
    alert("Please fill all fields!");
    return;
  }

  let fileURL = "";
  if (fileInput.files[0]) {
    fileURL = URL.createObjectURL(fileInput.files[0]); // temporary link to view file
  }

  // Create a new report object
  const newReport = {
    id: Date.now(),
    patientName,
    category,
    hospital,
    fileName: fileInput.files[0] ? fileInput.files[0].name : "No file",
    fileURL
  };

  // Add to temporary array
  reports.push(newReport);

  // Update UI
  displayReports("all");

  // Reset form
  document.getElementById("reportForm").reset();
});

// -------------------- Display Reports --------------------
function displayReports(filter) {
  const container = document.getElementById("reportsList");
  container.innerHTML = "";

  let filteredReports =
    filter === "all"
      ? reports
      : reports.filter((r) => r.category === filter);

  if (filteredReports.length === 0) {
    container.innerHTML = `<p>No reports found.</p>`;
    return;
  }

  filteredReports.forEach((report) => {
    const reportDiv = document.createElement("div");
    reportDiv.className = "report-card";
    reportDiv.innerHTML = `
      <h3>${report.patientName}</h3>
      <p><strong>Category:</strong> ${report.category}</p>
      <p><strong>Hospital:</strong> ${report.hospital}</p>
      <p><strong>File:</strong> ${report.fileName}</p>
      <div>
        <button onclick="viewReport(${report.id})">View</button>
        <button onclick="editReport(${report.id})">Edit</button>
        <button onclick="deleteReport(${report.id})">Delete</button>
      </div>
    `;
    container.appendChild(reportDiv);
  });
}

// -------------------- View Report --------------------
function viewReport(id) {
  const report = reports.find(r => r.id === id);
  if (report && report.fileURL) {
    window.open(report.fileURL, "_blank");
  } else {
    alert("No file uploaded for this report.");
  }
}

// -------------------- Edit Report --------------------
function editReport(id) {
  const report = reports.find(r => r.id === id);
  if (report) {
    document.getElementById("patientName").value = report.patientName;
    document.getElementById("category").value = report.category;
    document.getElementById("hospital").value = report.hospital;

    // Remove old report entry so the updated one replaces it
    reports = reports.filter(r => r.id !== id);
  }
}

// -------------------- Delete Report --------------------
function deleteReport(id) {
  if (confirm("Are you sure you want to delete this report?")) {
    reports = reports.filter(r => r.id !== id);
    displayReports("all");
  }
}

// -------------------- Filter Buttons --------------------
document.querySelectorAll(".filters button").forEach((btn) => {
  btn.addEventListener("click", function () {
    const filter = this.getAttribute("data-filter");
    displayReports(filter);
  });
});

// -------------------- Scan via Camera --------------------
document.getElementById("scanBtn").addEventListener("click", function () {
  const readerDiv = document.getElementById("reader");
  readerDiv.style.display = "block";

  const html5QrCode = new Html5Qrcode("reader");

  Html5Qrcode.getCameras()
    .then((devices) => {
      if (devices && devices.length) {
        html5QrCode.start(
          devices[0].id,
          { fps: 10, qrbox: 250 },
          (decodedText) => {
            // Expecting format: name|hospital|category
            const [name, hospital, category] = decodedText.split("|");
            document.getElementById("patientName").value = name || "";
            document.getElementById("hospital").value = hospital || "";
            document.getElementById("category").value = category || "";
            html5QrCode.stop();
            readerDiv.style.display = "none";
          },
          (errorMessage) => {
            console.warn("QR scan error:", errorMessage);
          }
        );
      } else {
        alert("No camera found!");
      }
    })
    .catch((err) => console.error("Camera error:", err));
});

// -------------------- Extract Text (OCR) --------------------
document.getElementById("ocrBtn").addEventListener("click", function () {
  const fileInput = document.getElementById("reportFile");
  if (!fileInput.files[0]) {
    alert("Please choose an image/PDF first");
    return;
  }

  Tesseract.recognize(fileInput.files[0], "eng", {
    logger: (m) => console.log(m),
  }).then(({ data: { text } }) => {
    console.log("OCR Result:", text);

    const lines = text.split("\n").map((l) => l.trim());

    // Try to auto-fill form fields if detected
    const patientLine = lines.find((l) =>
      l.toLowerCase().includes("patient")
    );
    const hospitalLine = lines.find((l) =>
      l.toLowerCase().includes("hospital")
    );

    if (patientLine)
      document.getElementById("patientName").value =
        patientLine.split(":")[1]?.trim() || "";
    if (hospitalLine)
      document.getElementById("hospital").value =
        hospitalLine.split(":")[1]?.trim() || "";
  });
});

// -------------------- Initial Load --------------------
displayReports("all");
