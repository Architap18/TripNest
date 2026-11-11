
import { useEffect, useRef, useState } from "react";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Eye,
} from "lucide-react";

import { apiRequest, API_URL } from "../services/api";

function TravelDocuments({ tripId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  // LOAD DOCUMENTS
  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest(`/documents/${tripId}`);
      setDocuments(data.documents || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripId) {
      loadDocuments();
    }
  }, [tripId]);

  // UPLOAD DOCUMENT
  const handleUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF, JPG, PNG and DOCX files are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be 10 MB or less.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("document", file);

      await apiRequest(`/documents/${tripId}`, {
        method: "POST",
        body: formData,
      });

      await loadDocuments();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  // VIEW DOCUMENT
  const handleView = async (doc) => {
    const isPreviewable =
      doc.contentType === "application/pdf" ||
      doc.contentType.startsWith("image/");

    if (!isPreviewable) {
      setError("Preview is unavailable for this file. Please download it.");
      return;
    }

    // Open the tab immediately to avoid popup blocking.
    const newTab = window.open("about:blank", "_blank");

    if (!newTab) {
      setError("Please allow pop-ups to view documents.");
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/documents/${tripId}/${doc.id}/download?preview=true`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Could not view document");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      newTab.location.href = url;

      // Revoke after the browser has had time to load the file.
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);

    } catch (err) {
      newTab.close();
      setError(err.message);
    }
  };

  // DOWNLOAD DOCUMENT
  const handleDownload = async (doc) => {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/documents/${tripId}/${doc.id}/download`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = window.document.createElement("a");
      link.href = url;
      link.download = doc.fileName;

      window.document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (err) {
      setError(err.message);
    }
  };

  // DELETE DOCUMENT
  const handleDelete = async (documentId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      setError("");

      await apiRequest(`/documents/${tripId}/${documentId}`, {
        method: "DELETE",
      });

      setDocuments((current) =>
        current.filter((doc) => doc.id !== documentId)
      );

    } catch (err) {
      setError(err.message);
    }
  };

  // FORMAT FILE SIZE
  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="feature-loading">
        Loading documents...
      </div>
    );
  }

  return (
    <section className="travel-documents">

      {/* HEADER */}
      <div className="documents-heading">
        <div>
          <h2>Travel Documents</h2>
          <p>Keep all your tickets and bookings in one place.</p>
        </div>

        <button
          className="feature-primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload size={17} />
          {uploading ? "Uploading..." : "Upload Document"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.docx"
          onChange={handleUpload}
          hidden
        />
      </div>

      <p className="documents-hint">
        Supported formats: PDF, JPG, PNG and DOCX.
        Maximum size: 10 MB.
      </p>

      {error && (
        <p className="feature-error">{error}</p>
      )}

      {/* EMPTY STATE */}
      {documents.length === 0 ? (
        <div className="feature-empty">
          <FileText size={36} />

          <h2>No documents uploaded yet</h2>

          <p>
            Upload flight tickets, hotel bookings
            or other travel documents.
          </p>

          <button
            className="feature-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload size={17} />
            Upload your first document
          </button>
        </div>
      ) : (

        /* DOCUMENT LIST */
        <div className="documents-list">

          {documents.map((doc) => (
            <article
              className="document-card"
              key={doc.id}
            >

              <div className="document-icon">
                <FileText size={25} />
              </div>

              <div className="document-info">
                <h3>{doc.fileName}</h3>

                <p>
                  {formatSize(doc.size)} ·{" "}
                  {new Date(doc.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="document-actions">

                <button
                  onClick={() => handleView(doc)}
                  title="View document"
                  aria-label="View document"
                >
                  <Eye size={18} />
                </button>

                <button
                  onClick={() => handleDownload(doc)}
                  title="Download document"
                  aria-label="Download document"
                >
                  <Download size={18} />
                </button>

                <button
                  onClick={() => handleDelete(doc.id)}
                  title="Delete document"
                  aria-label="Delete document"
                >
                  <Trash2 size={18} />
                </button>

              </div>
            </article>
          ))}

        </div>
      )}

    </section>
  );
}

export default TravelDocuments;
