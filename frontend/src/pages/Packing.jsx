
import { useEffect, useState } from "react";
import { Plus, Trash2, Luggage, Check } from "lucide-react";
import { apiRequest } from "../services/api";

const categories = [
  "CLOTHING",
  "TOILETRIES",
  "DOCUMENTS",
  "ELECTRONICS",
  "MEDICINE",
  "OTHER",
];

function Packing({ tripId, tripTitle, destination }) {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("OTHER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tripId) {
      setItems([]);
      return;
    }

    const loadItems = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await apiRequest(`/packing/${tripId}`);
        setItems(data.items || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [tripId]);

  const addItem = async (event) => {
    event.preventDefault();
    if (!name.trim() || !tripId) return;

    try {
      const data = await apiRequest(`/packing/${tripId}`, {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), category }),
      });

      setItems((current) => [...current, data.item]);
      setName("");
      setCategory("OTHER");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const togglePacked = async (item) => {
    try {
      const data = await apiRequest(`/packing/${tripId}/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isPacked: !item.isPacked }),
      });

      setItems((current) =>
        current.map((entry) => entry.id === item.id ? data.item : entry)
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await apiRequest(`/packing/${tripId}/${itemId}`, {
        method: "DELETE",
      });

      setItems((current) => current.filter((item) => item.id !== itemId));
    } catch (err) {
      setError(err.message);
    }
  };

  const packedCount = items.filter((item) => item.isPacked).length;
  const progress = items.length
    ? Math.round((packedCount / items.length) * 100)
    : 0;

  if (loading) {
    return <div className="feature-loading">Loading packing list...</div>;
  }

  return (
    <section className="packing-workspace">
      <div className="feature-title-row">
        <div>
          <span className="feature-eyebrow">GET READY TO GO</span>
          <h2>Packing Checklist</h2>
          <p>{tripTitle} · {destination}</p>
        </div>
        <Luggage size={36} />
      </div>

      {error && <p className="feature-error">{error}</p>}

      <div className="feature-trip-banner">
        <div>
          <span>YOUR PACKING PROGRESS</span>
          <h2>{packedCount} of {items.length} items packed</h2>
          <p>{progress}% completed</p>
        </div>
        <Luggage size={36} />
      </div>

      <div className="packing-progress">
        <div style={{ width: `${progress}%` }} />
      </div>

      <form className="packing-add-form" onSubmit={addItem}>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Add an item, e.g. Passport"
          required
        />

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {categories.map((value) => (
            <option key={value} value={value}>
              {value.charAt(0) + value.slice(1).toLowerCase()}
            </option>
          ))}
        </select>

        <button className="feature-primary">
          <Plus size={17} /> Add
        </button>
      </form>

      {categories.map((group) => {
        const groupItems = items.filter((item) => item.category === group);
        if (!groupItems.length) return null;

        return (
          <section className="packing-group" key={group}>
            <h3>
              {group.charAt(0) + group.slice(1).toLowerCase()}
              <span>{groupItems.length}</span>
            </h3>

            {groupItems.map((item) => (
              <div className="packing-item" key={item.id}>
                <button
                  type="button"
                  className={`packing-check ${item.isPacked ? "checked" : ""}`}
                  onClick={() => togglePacked(item)}
                  aria-label="Toggle packed status"
                >
                  {item.isPacked && <Check size={15} />}
                </button>

                <span className={item.isPacked ? "packed-text" : ""}>
                  {item.name}
                </span>

                <button
                  type="button"
                  className="packing-delete"
                  onClick={() => deleteItem(item.id)}
                  aria-label="Delete item"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </section>
        );
      })}

      {!items.length && (
        <div className="feature-empty">
          <Luggage size={36} />
          <h3>Your packing list is empty</h3>
          <p>Add your first item above.</p>
        </div>
      )}
    </section>
  );
}

export default Packing;
