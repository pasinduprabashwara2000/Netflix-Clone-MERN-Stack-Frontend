import { useEffect, useState } from "react";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/common/Pagination";
import { ui } from "../../lib/ui";
import { episodeApi, seasonApi } from "../../services/api";
import type { Episode, Season } from "../../services/api";
import { useAlert } from "../../alerts/context";

function EpisodeManagement() {
    const { success, error, warning, confirm } = useAlert();
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const pager = usePagination(episodes);
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [selectId, setSelectId] = useState<string | null>(null);
    const [seasonId, setSeasonId] = useState("");
    const [episodeNumber, setEpisodeNumber] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [durationMins, setDurationMins] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [thumbnailUrl, setThumbnailUrl] = useState("");

    useEffect(() => {
        loadEpisodes();
        loadSeasons();
    }, []);

    const handleSave = async () => {
        try {
            if (!seasonId || !episodeNumber || !title || !description || !durationMins || !videoUrl || !thumbnailUrl) {
                warning("Required All Fields");
                return;
            }

            const data = { seasonId, episodeNumber, title, description, durationMins, videoUrl, thumbnailUrl };

            if (selectId) {
                await episodeApi.update(selectId, data);
            } else {
                await episodeApi.create(data);
            }

            success(selectId ? "Episode Update Successfully" : "Episode Created Successfully");
            clearForm();
            await loadEpisodes();

        } catch (err) {
            error(err instanceof Error ? err.message : "Something went wrong");
        }
    };

    const handleUpdate = async (item: Episode) => {
        setSelectId(item._id);
        setSeasonId(typeof item.seasonId === "object" ? item.seasonId._id : item.seasonId);
        setEpisodeNumber(String(item.episodeNumber));
        setTitle(item.title);
        setDescription(item.description);
        setDurationMins(String(item.durationMins));
        setVideoUrl(item.videoUrl);
        setThumbnailUrl(item.thumbnailUrl);
    };

    const handleDelete = async (id : string) => {
        if (!await confirm({
            title: "Delete Episode?",
            message: "This episode will be permanently removed."
        })) return;

        try {
            await episodeApi.remove(id);
            success("Episode Deleted Successfully")
            clearForm();
            await loadEpisodes();
        } catch (err) {
            error((err as Error).message);
        }
    };

    const loadEpisodes = async () => {
        try{
            setEpisodes(await episodeApi.getAll());
        } catch (err) {
            error((err as Error).message);
        }
    };

    const loadSeasons = async () => {
        try {
            setSeasons(await seasonApi.getAll());
        } catch (err) {
            error((err as Error).message);
        }
    };

    const clearForm = () => {
        setSelectId(null);
        setSeasonId("");
        setEpisodeNumber("");
        setTitle("");
        setDescription("");
        setDurationMins("");
        setVideoUrl("");
        setThumbnailUrl("");
    };

    return (
        <div className={ui.page}>
            <h1 className={ui.title}>Manage Episode</h1>
            <p className={ui.subtitle}>Manage all episodes</p>

            <div className={ui.card}>
                <h2 className={ui.cardTitle}>{selectId ? "Edit Episode" : "New Episode"}</h2>

                <div className={ui.grid}>
                    <div className={ui.field}>
                        <label className={ui.label}>Season : </label>
                        <select className={ui.input} value={seasonId} onChange={(e) => setSeasonId(e.target.value)}>
                            <option value="">Select Season</option>
                            {seasons.map((s) => <option key={s._id} value={s._id}>{s.title}</option>)}
                        </select>
                    </div>

                    <div className={ui.field}>
                        <label className={ui.label}>Episode Number : </label>
                        <input type="number" className={ui.input} value={episodeNumber} placeholder="Enter Episode Number" onChange={(e) => setEpisodeNumber(e.target.value)} />
                    </div>

                    <div className={ui.field}>
                        <label className={ui.label}>Title : </label>
                        <input className={ui.input} value={title} placeholder="Enter Episode Title" onChange={(e) => setTitle(e.target.value)} />
                    </div>

                    <div className={ui.field}>
                        <label className={ui.label}>Description : </label>
                        <input className={ui.input} value={description} placeholder="Enter Description" onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    <div className={ui.field}>
                        <label className={ui.label}>Duration (Minutes) : </label>
                        <input type="number" className={ui.input} value={durationMins} placeholder="Enter Duration" onChange={(e) => setDurationMins(e.target.value)} />
                    </div>

                    <div className={ui.field}>
                        <label className={ui.label}>Video URL</label>
                        <input className={ui.input} value={videoUrl} placeholder="Enter Video URL" onChange={(e) => setVideoUrl(e.target.value)} />
                    </div>

                    <div className={ui.field}>
                        <label className={ui.label}>Thumbnail URL : </label>
                        <input className={ui.input} value={thumbnailUrl} placeholder="Enter Thumbnail URL" onChange={(e) => setThumbnailUrl(e.target.value)} />
                    </div>
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
                                        <button className={ui.btnSm} onClick={() => handleUpdate(item)}>Edit</button>
                                        <button className={ui.btnDanger} onClick={() => handleDelete(item._id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {episodes.length === 0 && <tr><td colSpan={6} className={ui.empty}>No Episodes yet.</td></tr>}
                    </tbody>
                </table>
            </div>

            <Pagination pager={pager} />
        </div>
    );
}

export default EpisodeManagement;