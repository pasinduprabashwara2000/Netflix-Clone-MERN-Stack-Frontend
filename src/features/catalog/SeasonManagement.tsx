import { useEffect, useState } from "react";
import { ui } from "../../lib/ui";
import { seasonApi } from "../../services/api";
import type { Season } from "../../services/api";
import { useAlert } from "../../alerts/context";

function SeasonManagement() {
    const { success, error, warning, confirm } = useAlert();
    const [season, setSeason] = useState<Season[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [seasonNo, setSeasonNo] = useState("");
    const [title, setTitle] = useState("");
    const [releaseYear, setReleaseYear] = useState("");

    const loadSeasons = async () => {
        try {
            const data = await seasonApi.getAll();
            setSeason(data);
        } catch (err) {
            error((err as Error).message);
        }
    };

    useEffect(() => {
        loadSeasons();
    }, []);

    const handleSave = async () => {
        try {
            if (!seasonNo || !title.trim() || !releaseYear) {
                warning("Please Fill All Fields");
                return;
            }

            const data = {
                seasonNumber: Number(seasonNo),
                title: title.trim(),
                releaseYear: Number(releaseYear)
            };

            if (!Number.isInteger(data.seasonNumber) || data.seasonNumber < 1 ||
                !Number.isInteger(data.releaseYear) || data.releaseYear < 1) {
                warning("Please Enter Valid Season Number and Release Year");
                return;
            }

            if (selectedId) {
                await seasonApi.update(selectedId, data);
                success("Season Updated Successfully");
            } else {
                await seasonApi.create(data);
                success("Season Created Successfully");
            }

            clearForm();
            await loadSeasons();
        } catch (err) {
            error((err as Error).message);
        }
    };

    const handleUpdate = (item: Season) => {
        setSelectedId(item._id);
        setSeasonNo(String(item.seasonNumber));
        setTitle(item.title);
        setReleaseYear(String(item.releaseYear));
    };

    const handleDelete = async (id: string) => {
        const isConfirmed = await confirm({
            title: "Delete Season?",
            message: "This Season will be permanently removed."
        });

        if (!isConfirmed) return;

        try {
            await seasonApi.remove(id);
            success("Season Deleted Successfully");

            if (selectedId === id) clearForm();

            await loadSeasons();
        } catch (err) {
            error((err as Error).message);
        }
    };

    const clearForm = () => {
        setSelectedId(null);
        setSeasonNo("");
        setTitle("");
        setReleaseYear("");
    };

    return (
        <div className={ui.page}>
            <h1 className={ui.title}>Manage Season</h1>
            <p className={ui.subtitle}>Manage your seasons here.</p>

            {/* SEASON FORM */}
            <div className={ui.card}>
                <h2 className={ui.cardTitle}>{selectedId ? "Edit Season" : "New Season"}</h2>
                <div className={ui.grid}>
                    <div className={ui.field}>
                        <label className={ui.label}>Season No :</label>
                        <input className={ui.input} type="number" min="1" value={seasonNo} onChange={(e) => setSeasonNo(e.target.value)} placeholder="Enter Season Number" />
                    </div>
                    <div className={ui.field}>
                        <label className={ui.label}>Title :</label>
                        <input className={ui.input} type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter Season Title" />
                    </div>
                    <div className={ui.field}>
                        <label className={ui.label}>Release Year :</label>
                        <input className={ui.input} type="number" min="1" value={releaseYear} onChange={(e) => setReleaseYear(e.target.value)} placeholder="Enter Release Year" />
                    </div>
                    <div className={ui.actions}>
                        <button className={ui.btnPrimary} onClick={handleSave}>{selectedId ? "Update Season" : "Save Season"}</button>
                        <button className={ui.btn} onClick={clearForm}>Clear</button>
                    </div>
                </div>
            </div>

            <h2 className="mt-10 text-xl font-bold">
                All Seasons <span className="ml-1 text-sm font-normal text-muted">({season.length})</span>
            </h2>

            <div className={ui.tableWrap}>
                <table className={ui.table}>
                    <thead>
                        <tr>
                            <th className={ui.th}>Season No</th>
                            <th className={ui.th}>Title</th>
                            <th className={ui.th}>Release Year</th>
                            <th className={ui.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {season.length === 0 && (
                            <tr>
                                <td colSpan={4} className={ui.empty}>No Seasons yet</td>
                            </tr>
                        )}

                    {season.map((item) => (
                        <tr key={item._id} className={ui.tr}>
                            <td className={ui.td}>{item.seasonNumber}</td>
                            <td className={ui.td}>{item.title}</td>
                            <td className={ui.td}>{item.releaseYear}</td>
                            <th className={ui.td}>
                                    <div className="flex justify-items-end gap-2">
                                        <button className={ui.btnSm} onClick={()=> handleUpdate(item)}>Edit</button>
                                        <button className={ui.btnDanger} onClick={()=> handleDelete(item._id)}>Delete</button>
                                    </div>
                            </th>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}

export default SeasonManagement;