import { ui } from "../../lib/ui";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/common/Pagination";
import ImageUrlInput from "../../components/common/ImageUrlInput";
import { contentApi, genreApi } from "../../services/api";
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import type { Content, Genre } from "../../services/api";
import { useAlert } from "../../alerts/context";

const EMPTY = {
    title: '', description: '', type: '', releaseYear: '', maturityRating: '', durationMins: '',
    genreId: '', posterUrl: '', bannerUrl: '', trailer: '', videoUrl: '', avgRating: '', isFeatured: false,
};
type Form = typeof EMPTY;
type TextKey = Exclude<keyof Form, 'isFeatured'>;
// every text field except the optional genre must be filled in
const REQUIRED = (Object.keys(EMPTY) as TextKey[]).filter((key) => key !== 'genreId');

function ContentManagement() {
    const { success, error, warning, confirm } = useAlert();
    const [contents, setContents] = useState<Content[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [form, setForm] = useState<Form>(EMPTY);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const pager = usePagination(contents);

    const setField = (key: TextKey, value: string) => setForm((f) => ({ ...f, [key]: value }));
    const bind = (key: TextKey) => ({
        value: form[key],
        onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setField(key, e.target.value),
    });

    const loadContents = async () => {
        try {
            setContents(await contentApi.getAll());
        } catch (err) {
            error((err as Error).message);
        }
    };

    useEffect(() => {
        loadContents();
        genreApi.getAll().then(setGenres).catch((err: Error) => error(err.message));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleClear = () => {
        setSelectedId(null);
        setForm(EMPTY);
    };

    const handleSave = async () => {
        if (REQUIRED.some((key) => !form[key])) {
            warning('All Fields Required');
            return;
        }

        try {
            const payload = { ...form, releaseYear: Number(form.releaseYear), avgRating: Number(form.avgRating) };

            if (selectedId) {
                await contentApi.update(selectedId, payload);
            } else {
                await contentApi.create(payload);
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
        setForm({
            ...EMPTY,
            ...item,
            releaseYear: String(item.releaseYear),
            avgRating: String(item.avgRating),
            genreId: item.genreId ?? '',
        });
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

    // one labelled text input per field
    const field = (key: TextKey, label: string, type = 'text') => (
        <div className={ui.field}>
            <label className={ui.label}>{label} : </label>
            <input className={ui.input} type={type} step={key === 'avgRating' ? '0.1' : undefined}
                   placeholder={`Enter Content ${label}`} {...bind(key)} />
        </div>
    );

    return (
        <div className={ui.page}>
            <h1 className={ui.title}>Manage Content</h1>
            <p className={ui.subtitle}>Manage All Contents here</p>

            <div className={ui.card}>
                <h2 className={ui.cardTitle}>{selectedId ? 'Edit Content' : 'New Content'}</h2>
                <div className={ui.grid}>
                    {field('title', 'Title')}
                    {field('description', 'Description')}
                    {field('type', 'Type')}
                    {field('releaseYear', 'Release Year', 'number')}
                    {field('maturityRating', 'Maturity Rating')}
                    {field('durationMins', 'Duration')}

                    <div className={ui.field}>
                        <label className={ui.label}>Genre : </label>
                        <select className={ui.select} {...bind('genreId')}>
                            <option value="">Select Genre</option>
                            {genres.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
                        </select>
                    </div>

                    <ImageUrlInput label="Poster Image URL : " value={form.posterUrl}
                                   onChange={(v) => setField('posterUrl', v)} previewClassName="h-40" />
                    <ImageUrlInput label="Banner Image URL : " value={form.bannerUrl}
                                   onChange={(v) => setField('bannerUrl', v)} previewClassName="h-28" />

                    {field('trailer', 'Trailer')}
                    {field('videoUrl', 'Video URL')}
                    {field('avgRating', 'Average Rating', 'number')}

                    <div className={ui.field}>
                        <label className={ui.check}>
                            <input type="checkbox" className={ui.checkbox} checked={form.isFeatured}
                                   onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} />
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
                            <tr><td colSpan={7} className={ui.empty}>No contents yet</td></tr>
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
