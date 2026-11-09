import { ui } from "../../lib/ui";
import { contentApi, genreApi } from "../../services/api";
import { useEffect, useState } from "react";
import type { Content, Genre } from "../../services/api";
import { useAlert } from "../../alerts/context";

function ContentManagement() {
    const { success, error, warning, confirm } = useAlert();
    const [contents, setContents] = useState<Content[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('');
    const [releaseYear, setReleaseYear] = useState('');
    const [maturityRating, setMaturityRating] = useState('');
    const [duration, setDuration] = useState('');
    const [genreId, setGenreId] = useState('');
    const [posterUrl, setPosterUrl] = useState('');
    const [bannerUrl, setBannerUrl] = useState('');
    const [trailer, setTrailer] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);
    const [avgRating, setAvgRating] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const loadContents = async () => {
        try {
            setContents(await contentApi.getAll());
        } catch (err) {
            error((err as Error).message);
        }
    };

    const loadGenres = async () => {
        try {
            setGenres(await genreApi.getAll());
        } catch (err) {
            error((err as Error).message);
        }
    };

    useEffect(() => {
        loadContents();
        loadGenres();
    }, []);

    const handleClear = () => {
        setSelectedId(null);
        setTitle('');
        setDescription('');
        setType('');
        setReleaseYear('');
        setMaturityRating('');
        setDuration('');
        setGenreId('');
        setPosterUrl('');
        setBannerUrl('');
        setTrailer('');
        setVideoUrl('');
        setIsFeatured(false);
        setAvgRating('');
    };

    const handleSave = async () => {
        try {
            if (!title || !description || !type || !releaseYear || !maturityRating || !duration || !posterUrl || !bannerUrl || !trailer || !videoUrl || !avgRating) {
                warning('All Fields Required');
                return;
            }

            const data = {
                title, description, type, maturityRating, posterUrl, bannerUrl, trailer, videoUrl, isFeatured,
                releaseYear: Number(releaseYear),
                durationMins: duration,
                avgRating: Number(avgRating),
                ...(genreId && { genreId }),
            };

            if (selectedId) {
                await contentApi.update(selectedId, data);
            } else {
                await contentApi.create(data);
            }

            success(selectedId ? "Content Updated" : "Content Created");
            handleClear();
            await loadContents();
        } catch (err) {
            error((err as Error).message);
        }
    };

    const editContent = (item: Content) => {
        setSelectedId(item._id);
        setTitle(item.title);
        setDescription(item.description);
        setType(item.type);
        setReleaseYear(String(item.releaseYear));
        setMaturityRating(item.maturityRating);
        setDuration(item.durationMins);
        setGenreId(item.genreId ?? '');
        setPosterUrl(item.posterUrl);
        setBannerUrl(item.bannerUrl);
        setTrailer(item.trailer);
        setVideoUrl(item.videoUrl);
        setIsFeatured(item.isFeatured);
        setAvgRating(String(item.avgRating));
    };

    const deleteContent = async (id: string) => {
        if (!await confirm({ title: 'Delete Content?', message: 'This content will be permanently removed' })) return;

        try {
            await contentApi.remove(id);
            success("Content Deleted");
            if (selectedId === id) handleClear();
            await loadContents();
        } catch (err) {
            error((err as Error).message);
        }
    };

    return (
        <div className={ui.page}>
            <h1 className={ui.title}>Manage Content</h1>
            <p className={ui.subtitle}>Manage All Contents here</p>

            <div className={ui.card}>
                <h2 className={ui.cardTitle}>{selectedId ? 'Edit Content' : 'New Content'}</h2>
                <div className={ui.grid}>
                    <div className={ui.field}>
                        <label className={ui.label}>Title : </label>
                        <input className={ui.input} value={title} placeholder="Enter Content Title" onChange={(e) => setTitle(e.target.value)} />
                    </div>

                    <div className={ui.field}>
                        <label className={ui.label}>Description : </label>
                        <input className={ui.input} type="text" value={description} placeholder="Enter Content Description" onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    <div className={ui.field}>
                        <label className={ui.label}>Type : </label>
                        <input className={ui.input} value={type} placeholder="Enter Content Type" onChange={(e) => setType(e.target.value)} />
                    </div>

                    <div className={ui.field}>
                        <label className={ui.label}>Release Year : </label>
                        <input className={ui.input} type="number" value={releaseYear} placeholder="Enter Content Release Year" onChange={(e) => setReleaseYear(e.target.value)} />
                    </div>

                    <div className={ui.field}>
                        <label className={ui.label}>Maturity Rating : </label>
                        <input className={ui.input} type="text" value={maturityRating} placeholder="Enter Content Maturity Rating" onChange={(e) => setMaturityRating(e.target.value)} />
                    </div>

                    <div className={ui.field}>
                        <label className={ui.label}>Duration : </label>
                        <input className={ui.input} type="text" value={duration} placeholder="Enter Content Duration" onChange={(e) => setDuration(e.target.value)} />
                    </div>

                    <div className={ui.field}>
                        <label className={ui.label}>Genre : </label>
                        <select className={ui.select} value={genreId} onChange={(e) => setGenreId(e.target.value)}>
                            <option value="">Select Genre</option>
                            {genres.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
                        </select>
                    </div>

                    <div className={ui.field}>
                        <label className={ui.label}>Poster URL : </label>
                        <input className={ui.input} type="text" value={posterUrl} placeholder="Enter Content Poster URL" onChange={(e) => setPosterUrl(e.target.value)} />
                    </div>

                    <div className={ui.field}>
                        <label className={ui.label}>Banner URL : </label>
                        <input className={ui.input} type="text" value={bannerUrl} placeholder="Enter Content Banner URL" onChange={(e) => setBannerUrl(e.target.value)} />
                    </div>

                    <div className={ui.field}>
                        <label className={ui.label}>Trailer : </label>
                        <input className={ui.input} value={trailer} placeholder="Enter Content Trailer" onChange={(e) => setTrailer(e.target.value)} />
                    </div>

                    <div className={ui.field}>
                        <label className={ui.label}>Video URL : </label>
                        <input className={ui.input} value={videoUrl} placeholder="Enter Content Video URL" onChange={(e) => setVideoUrl(e.target.value)} />
                    </div>

                    <div className={ui.field}>
                        <label className={ui.label}>Average Rating : </label>
                        <input className={ui.input} type="number" step="0.1" value={avgRating} placeholder="Enter Content Average Rating" onChange={(e) => setAvgRating(e.target.value)} />
                    </div>

                    <div className={ui.field}>
                        <label className={ui.check}>
                            <input type="checkbox" className={ui.checkbox} checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
                            Is Featured
                        </label>
                    </div>

                    <div className={`${ui.actions} sm:col-span-2`}>
                        <button className={ui.btnPrimary} onClick={handleSave}>{selectedId ? 'Update Content' : 'Save Content'}</button>
                        <button className={ui.btn} onClick={handleClear}>Clear</button>
                    </div>
                </div>
            </div>

            <h2 className="mt-10 text-xl font-black uppercase tracking-tighter text-zinc-100">
                All Contents <span className="ml-1 text-sm font-medium text-zinc-500">({contents.length})</span>
            </h2>

            <div className={ui.tableWrap}>
                <table className={ui.table}>
                    <thead>
                        <tr>
                            <th className={ui.th}>Title</th>
                            <th className={ui.th}>Type</th>
                            <th className={ui.th}>Release Year</th>
                            <th className={ui.th}>Maturity Rating</th>
                            <th className={ui.th}>Duration</th>
                            <th className={ui.th}>Is Featured</th>
                            <th className={`${ui.th} text-right`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contents.length === 0 && (
                            <tr><td colSpan={8} className={ui.empty}>No contents yet</td></tr>
                        )}
                        {contents.map((item) => (
                            <tr key={item._id} className={ui.tr}>
                                <td className={`${ui.td} font-bold text-zinc-100`}>{item.title}</td>
                                <td className={ui.td}>{item.type}</td>
                                <td className={ui.td}>{item.releaseYear}</td>
                                <td className={ui.td}>{item.maturityRating}</td>
                                <td className={ui.td}>{item.durationMins}</td>
                                <td className={ui.td}>
                                    <span className={ui.badge(item.isFeatured ? 'green' : 'gray')}>
                                        {item.isFeatured ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className={ui.td}>
                                    <div className="flex justify-end gap-2">
                                        <button className={ui.btnSm} onClick={() => editContent(item)}>Edit</button>
                                        <button className={ui.btnDanger} onClick={() => deleteContent(item._id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ContentManagement;