import { useEffect, useState } from "react";

const NotesList = () => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/notes/get-notes")
      .then((res) => res.json())
      .then((data) => setNotes(data))
      .catch((err) => console.error("Error fetching notes:", err));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Corrected Notes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div key={note._id} className="p-4 border rounded shadow-md">
              <h3 className="font-semibold">
                {note.filename || "Untitled Note"}
              </h3>
              <p className="text-sm text-gray-600">{note.subject}</p>
              <a
                href={note.corrected_text_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View Corrected Text
              </a>
            </div>
          ))
        ) : (
          <p>No corrected notes found.</p>
        )}
      </div>
    </div>
  );
};

export default NotesList;
