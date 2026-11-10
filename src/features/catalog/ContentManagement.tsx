import { ui } from "../../lib/ui";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/common/Pagination";
import { contentApi, genreApi } from "../../services/api";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { Content, Genre } from "../../services/api";
import { useAlert } from "../../alerts/context";
import { resolveImageUrl } from "../../lib/media";

const MAX_POSTER_BYTES = 2 * 1024 * 1024;

function ContentManagement() {
    const { success, error, warning, confirm } = useAlert();
    const [contents, setContents] = useState<Content[]>([]);
    const pager = usePagination(contents);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('');
    const [releaseYear, setReleaseYear] = useState('');
    const [maturityRating, setMaturityRating] = useState('');
    const [duration, setDuration] = useState('');
    const [genreId, setGenreId] = useState('');
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [posterPreview, setPosterPreview] = useState('');
    const posterInput = useRef<HTMLInputElement>(null);
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

    const revokePreview = (url: string) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    };

    const handlePosterChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            warning('Poster must be an image file');
            e.target.value = '';
            return;
        }
        if (file.size > MAX_POSTER_BYTES) {
            warning('Poster must be 2 MB or smaller');
            e.target.value = '';
            return;
        }

        revokePreview(posterPreview);
        setPosterFile(file);
        setPosterPreview(URL.createObjectURL(file));
    };

    const handleClear = () => {
        revokePreview(posterPreview);
        setPosterFile(null);
        setPosterPreview('');
        if (posterInput.current) posterInput.current.value = '';
        setSelectedId(null);
        setTitle('');
        setDescription('');
        setType('');
        setReleaseYear('');
        setMaturityRating('');
        setDuration('');
        setGenreId('');
        setBannerUrl('');
        setTrailer('');
        setVideoUrl('');
        setIsFeatured(false);
        setAvgRating('');
    };

    const handleSave = async () => {
        try {
            if (!title || !description || !type || !releaseYear || !maturityRating || !duration || (!selectedId && !posterFile) || !bannerUrl || !trailer || !videoUrl || !avgRating) {
                warning('All Fields Required');
                return;
            }

            const form = new FormData();
            const fields: Record<string, string> = {
                title, description, type, maturityRating, bannerUrl, trailer, videoUrl,
                releaseYear: String(Number(releaseYear)),
                durationMins: duration,
                avgRating: String(Number(avgRating)),
                isFeatured: String(isFeatured),
            };
            Object.entries(fields).forEach(([key, value]) => form.append(key, value));
            if (genreId) form.append('genreId', genreId);
            if (posterFile) form.append('poster', posterFile);

            if (selectedId) {
                await contentApi.updateWithPoster(selectedId, form);
            } else {
                await contentApi.createWithPoster(form);
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
        revokePreview(posterPreview);
        setPosterFile(null);
        setPosterPreview(resolveImageUrl(item.posterUrl));
        if (posterInput.current) posterInput.current.value = '';
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
                        <label className={ui.label}>Poster Image : </label>
                        <input
                            ref={posterInput}
                            className={ui.input}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                            onChange={handlePosterChange}
                        />
                        {posterPreview && (
                            <img
                                src={posterPreview}
                                alt="Poster preview"
                                className="mt-2 h-40 w-auto rounded border-2 border-zinc-800 object-cover"
                            />
                        )}
                        <p className="mt-1 text-xs text-zinc-500">
                            JPEG, PNG, WebP, GIF or AVIF, max 2 MB{selectedId ? ' - leave empty to keep the current poster' : ''}
                        </p>
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
                        {pager.items.map((item) => (
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

            <Pagination pager={pager} />
        </div>
    );
}

export default ContentManagement;