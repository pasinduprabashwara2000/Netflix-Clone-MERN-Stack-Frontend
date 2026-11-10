import { useEffect, useState } from "react";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/common/Pagination";
import type { Genre } from "../../services/api";
import { ui } from "../../lib/ui";
import { genreApi } from "../../services/api";
import { useAlert } from "../../alerts/context";

function GenreManagement() {
    const { success, error, warning, confirm } = useAlert();
    const [genres, setGenres] = useState<Genre[]>([]);
    const pager = usePagination(genres);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const loadGenres = async () => {
        try {
            setGenres(await genreApi.getAll());
        } catch (err) {
            error((err as Error).message);
        }
    };

    useEffect(() => {
        loadGenres();
    }, []);

    const saveGenre = async () => {
        try {
            if (!name.trim() || !description.trim()) {
                warning("Please Enter Name and Description");
                return;
            }

            const data = { name: name.trim(), description: description.trim() };

            if (selectedId) {
                await genreApi.update(selectedId, data);
                success("Genre Updated Successfully");
            } else {
                await genreApi.create(data);
                success("Genre Created Successfully");
            }

            handleClear();
            await loadGenres();
        } catch (err) {
            error((err as Error).message);
        }
    };

    const editGenre = (item: Genre) => {
        setSelectedId(item._id);
        setName(item.name);
        setDescription(item.description);
    };

    const deleteGenre = async (id: string) => {
        if (!await confirm({
            title: "Delete Genre?",
            message: "This genre will be permanently removed."
        })) return;

        try {
            await genreApi.remove(id);
            success("Genre Deleted Successfully");
            handleClear();
            await loadGenres();
        } catch (err) {
            error((err as Error).message);
        }
    };

    const handleClear = () => {
        setSelectedId(null);
        setName("");
        setDescription("");
    };

    return (
        <div className={ui.page}>
            <h1 className={ui.title}>Manage Genre</h1>
            <p className={ui.subtitle}>Manage your content genres here.</p>

            {/* GENRE FORM */}
            <div className={ui.card}>
                <h2 className={ui.cardTitle}>{selectedId ? "Edit Genre" : "New Genre"}</h2>
                <div className={ui.grid}>
                    <div className={ui.field}>
                        <label className={ui.label}>Name :</label>
                        <input className={ui.input} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Genre Name" />
                    </div>
                    <div className={ui.field}>
                        <label className={ui.label}>Description :</label>
                        <input className={ui.input} type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter Genre Description" />
                    </div>
                    <div className={`${ui.actions} sm:col-span-2`}>
                        <button className={ui.btnPrimary} onClick={saveGenre}>
                            {selectedId ? "Update Genre" : "Save Genre"}
                        </button>
                        <button className={ui.btn} onClick={handleClear}>Clear</button>
                    </div>
                </div>
            </div>

            <h2 className="mt-10 text-xl font-black uppercase tracking-tighter text-zinc-100">
                All Genre <span className="ml-1 text-sm font-medium text-zinc-500">({genres.length})</span>
            </h2>

            <div className={ui.tableWrap}>
                <table className={ui.table}>
                    <thead>
                    <tr>
                        <th className={ui.th}>Name</th>
                        <th className={ui.th}>Description</th>
                        <th className={`${ui.th} text-right`}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {genres.length === 0 && (
                        <tr>
                            <td colSpan={3} className={ui.empty}>No genres yet</td>
                        </tr>
                    )}
                    {pager.items.map((item) => (
                        <tr key={item._id} className={ui.tr}>
                            <td className={ui.td}>{item.name}</td>
                            <td className={ui.td}>{item.description}</td>
                            <td className={ui.td}>
                                <div className="flex justify-end gap-2">
                                    <button className={ui.btnSm} onClick={() => editGenre(item)}>Edit</button>
                                    <button className={ui.btnDanger} onClick={() => deleteGenre(item._id)}>Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <Pagination pager={pager} />
        </div>
    );
}

export default GenreManagement;