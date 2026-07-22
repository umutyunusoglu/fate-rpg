import type { Character, EquipmentCategory } from "../../model/character";
import { newEquipmentItem } from "../../model/character";
import { moveItem, removeAt, replaceAt } from "../../utils/array";

interface EquipmentSectionProps {
  character: Character;
  editable: boolean;
  patch: (updater: (c: Character) => Character) => void;
}

const CATEGORIES: EquipmentCategory[] = ["weapon", "armor", "gear", "extra"];

export function EquipmentSection({
  character,
  editable,
  patch,
}: EquipmentSectionProps) {
  return (
    <section className="sheet-section">
      <h2>Extras / Equipment</h2>

      {character.equipment.map((item, i) => (
        <div className="equipment-row" key={item.id}>
          <div className="equipment-row-top">
            <input
              className="equipment-name"
              value={item.name}
              disabled={!editable}
              placeholder="Name"
              onChange={(e) =>
                patch((c) => ({
                  ...c,
                  equipment: replaceAt(c.equipment, i, {
                    ...item,
                    name: e.target.value,
                  }),
                }))
              }
            />
            <select
              value={item.category}
              disabled={!editable}
              onChange={(e) =>
                patch((c) => ({
                  ...c,
                  equipment: replaceAt(c.equipment, i, {
                    ...item,
                    category: e.target.value as EquipmentCategory,
                  }),
                }))
              }
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              className="equipment-qty"
              type="number"
              min={1}
              value={item.quantity}
              disabled={!editable}
              onChange={(e) =>
                patch((c) => ({
                  ...c,
                  equipment: replaceAt(c.equipment, i, {
                    ...item,
                    quantity: Number(e.target.value) || 1,
                  }),
                }))
              }
            />
          </div>
          <textarea
            rows={1}
            placeholder="Description"
            value={item.description}
            disabled={!editable}
            onChange={(e) =>
              patch((c) => ({
                ...c,
                equipment: replaceAt(c.equipment, i, {
                  ...item,
                  description: e.target.value,
                }),
              }))
            }
          />
          <input
            placeholder='Effect (e.g. "Weapon:2", "+2 to Fight")'
            value={item.effect}
            disabled={!editable}
            onChange={(e) =>
              patch((c) => ({
                ...c,
                equipment: replaceAt(c.equipment, i, {
                  ...item,
                  effect: e.target.value,
                }),
              }))
            }
          />
          {editable && (
            <div className="row-actions">
              <button
                type="button"
                onClick={() =>
                  patch((c) => ({
                    ...c,
                    equipment: moveItem(c.equipment, i, -1),
                  }))
                }
                disabled={i === 0}
                title="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() =>
                  patch((c) => ({
                    ...c,
                    equipment: moveItem(c.equipment, i, 1),
                  }))
                }
                disabled={i === character.equipment.length - 1}
                title="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                className="danger"
                onClick={() =>
                  patch((c) => ({
                    ...c,
                    equipment: removeAt(c.equipment, i),
                  }))
                }
                title="Remove"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ))}

      {editable && (
        <button
          type="button"
          onClick={() =>
            patch((c) => ({
              ...c,
              equipment: [...c.equipment, newEquipmentItem()],
            }))
          }
        >
          Add item
        </button>
      )}
    </section>
  );
}
