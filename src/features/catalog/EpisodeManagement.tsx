import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/common/Pagination";
import ImageUrlInput from "../../components/common/ImageUrlInput";
import { ui } from "../../lib/ui";
import { episodeApi, seasonApi } from "../../services/api";
import type { Episode, Season } from "../../services/api";
import { useAlert } from "../../alerts/context";

const EMPTY = {
    seasonId: "", episodeNumber: "", title: "", description: "", durationMins: "", videoUrl: "", thumbnailUrl: "",
};
type Form = typeof EMPTY;

function EpisodeManagement() {
    const { success, error, warning, confirm } = useAlert();
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [form, setForm] = useState<Form>(EMPTY);
    const [selectId, setSelectId] = useState<string | null>(null);
    const pager = usePagination(episodes);

    const setField = (key: keyof Form, value: string) => setForm((f) => ({ ...f, [key]: value }));
    const bind = (key: keyof Form) => ({
        value: form[key],
        onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setField(key, e.target.value),
    });

    const loadEpisodes = async () => {
        try {
            setEpisodes(await episodeApi.getAll());
        } catch (err) {
            error((err as Error).message);
        }
    };

    useEffect(() => {
        loadEpisodes();
        seasonApi.getAll().then(setSeasons).catch((err: Error) => error(err.message));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const clearForm = () => {
        setSelectId(null);
        setForm(EMPTY);
    };

    const handleSave = async () => {
        if (Object.values(form).some((value) => !value)) {
            warning("Required All Fields");
            return;
        }

        try {
            const payload = {
                ...form,
                episodeNumber: Number(form.episodeNumber),
                durationMins: Number(form.durationMins),
            };

            if (selectId) {
                await episodeApi.update(selectId, payload);
            } else {
                await episodeApi.create(payload);
            }

            success(selectId ? "Episode Update Successfully" : "Episode Created Successfully");
            clearForm();
            await loadEpisodes();
        } catch (err) {
            error(err instanceof Error ? err.message : "Something went wrong");
        }
    };

    const handleEdit = (item: Episode) => {
        setSelectId(item._id);
        setForm({
            ...EMPTY,
            ...item,
            episodeNumber: String(item.episodeNumber),
            durationMins: String(item.durationMins),
        });
    };

    const handleDelete = async (id: string) => {
        if (!await confirm({
            title: "Delete Episode?",
            message: "This episode will be permanently removed."
        })) return;

        try {
            await episodeApi.remove(id);
            success("Episode Deleted Successfully");
            clearForm();
            await loadEpisodes();
        } catch (err) {
            error((err as Error).message);
        }
    };

    // one labelled text input per field
    const field = (key: keyof Form, label: string, type = "text") => (
        <div className={ui.field}>
            <label className={ui.label}>{label} : </label>
            <input type={type} className={ui.input} placeholder={`Enter ${label}`} {...bind(key)} />
        </div>
    );

    return (
        <div className={ui.page}>
            <h1 className={ui.title}>Manage Episode</h1>
            <p className={ui.subtitle}>Manage all episodes</p>

            <div className={ui.card}>
                <h2 className={ui.cardTitle}>{selectId ? "Edit Episode" : "New Episode"}</h2>

                <div className={ui.grid}>
                    <div className={ui.field}>
                        <label className={ui.label}>Season : </label>
                        <select className={ui.input} {...bind("seasonId")}>
                            <option value="">Select Season</option>
                            {seasons.map((s) => <option key={s._id} value={s._id}>{s.title}</option>)}
                        </select>
                    </div>

                    {field("episodeNumber", "Episode Number", "number")}
                    {field("title", "Title")}
                    {field("description", "Description")}
                    {field("durationMins", "Duration (Minutes)", "number")}
                    {field("videoUrl", "Video URL")}

                    <ImageUrlInput label="Thumbnail Image URL : " value={form.thumbnailUrl}
                                   onChange={(v) => setField("thumbnailUrl", v)} previewClassName="h-28" />
                </div>

                <div className={ui.actions}>
                    <button className={ui.btnPrimary} onClick={handleSave}>{selectId ? "Update Episode" : "Save Episode"}</button>
                    <button className={ui.btn} onClick={clearForm}>Clear</button>
                </div>
            </div>

            <h2 className="mt-10 text-xl font-bold">
                All Episodes <span className="ml-1 text-sm font-normal text-muted">({episodes.length})</span>
            </h2>

            <div className={ui.tableWrap}>
                <table className={ui.table}>
                    <thead>
                        <tr>
                            <th className={ui.th}>Episode Number</th>
                            <th className={ui.th}>Title</th>
                            <th className={ui.th}>Description</th>
                            <th className={ui.th}>Duration</th>
                            <th className={`${ui.th} text-right`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pager.items.map((item) => (
                            <tr key={item._id} className={ui.tr}>
                                <td className={ui.td}>{item.episodeNumber}</td>
                                <td className={`${ui.td} font-semibold`}>{item.title}</td>
                                <td className={ui.td}>{item.description}</td>
                                <td className={ui.td}>{item.durationMins} min</td>
                                <td className={ui.td}>
                                    <div className="flex justify-items-end gap-2">
                                        <button className={ui.btnSm} onClick={() => handleEdit(item)}>Edit</button>
                                        <button className={ui.btnDanger} onClick={() => handleDelete(item._id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {episodes.length === 0 && <tr><td colSpan={5} className={ui.empty}>No Episodes yet.</td></tr>}
                    </tbody>
                </table>
            </div>

            <Pagination pager={pager} />
        </div>
    );
}

export default EpisodeManagement;
