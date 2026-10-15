import { useEffect, useState } from "react";
import { ui } from "../ui";
import { profileApi, userApi } from "../services/api";
import type { Profile, User } from "../services/api";
import { useAlert } from '../alerts/context'

function ProfileManagement() {
    const { success, error, warning, confirm } = useAlert()
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selectId, setSelectId] = useState("");
    const [userId, setUserId] = useState("");
    const [name, setName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [isKids, setIsKids] = useState(true);
    const [language, setLanguage] = useState("English");
    const [maturityLevel, setMaturityLevel] = useState("All");

    const clearForm = () => {
        setSelectId("");
        setUserId("");
        setName("");
        setAvatarUrl("");
        setIsKids(true);
        setLanguage("English");
        setMaturityLevel("All");
    };

    const loadProfiles = async () => {
        try {
            setProfiles(await profileApi.getAll());
        } catch (err) {
            error((err as Error).message);
        }
    };

    const loadUsers = async () => {
        try {
            setUsers(await userApi.getAll());
        } catch (err) {
            error((err as Error).message);
        }
    };

    const saveProfile = async () => {
        if (!userId || !name || !avatarUrl || !language || !maturityLevel) {
            warning("Please enter user, name, avatarUrl, language, and maturityLevel");
            return;
        }

        const data = { userId, name, avatarUrl, isKids, language, maturityLevel };

        try {
            if (selectId) {
                await profileApi.update(selectId, data);
            } else {
                await profileApi.create(data);
            }
            success(selectId ? 'Profile updated' : 'Profile created')

            await loadProfiles();
            clearForm();
        } catch (err) {
            error((err as Error).message);
        }
    };

    const editProfile = (p: Profile) => {
        // userId may come back as a string or a populated user object
        const rawUserId = p.userId as unknown;
        const id =
            typeof rawUserId === "object" && rawUserId !== null
                ? (rawUserId as { _id: string })._id
                : (rawUserId as string);

        setSelectId(p._id);
        setUserId(id ?? "");
        setName(p.name);
        setAvatarUrl(p.avatarUrl);
        setIsKids(p.isKids);
        setLanguage(p.language);
        setMaturityLevel(p.maturityLevel);
    };

    const deleteProfile = async (id: string) => {
        if (!(await confirm({ title: "Delete profile?", message: "This profile will be permanently removed." }))) return;

        try {
            await profileApi.remove(id);
            success('Profile deleted');
            await loadProfiles();
            if (selectId === id) clearForm();
        } catch (err) {
            error((err as Error).message);
        }
    };

    useEffect(() => {
        loadProfiles();
        loadUsers();
    }, []);

    return (
        <div className={ui.page}>
            <h1 className={ui.title}>Manage Profile</h1>
            <p className={ui.subtitle}>User profiles</p>

            <div className={ui.card}>
                <h2 className={ui.cardTitle}>{selectId ? "Edit Profile" : "New Profile"}</h2>

                <div className={ui.grid}>
                    <div className={ui.field}>
                        <label className={ui.label}>User</label>
                        <select className={ui.input} name="userId" value={userId} onChange={(e) => setUserId(e.target.value)}>
                            <option value="">Select User</option>
                            {users.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.name} ({user._id})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={ui.field}>
                        <label className={ui.label}>Name</label>
                        <input className={ui.input} type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div className={ui.field}>
                        <label className={ui.label}>Avatar URL</label>
                        <input className={ui.input} type="text" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
                    </div>

                    <div className={ui.field}>
                        <label className={ui.label}>Is Kids</label>
                        <select
                            className={ui.input}
                            value={isKids ? "true" : "false"}
                            onChange={(e) => setIsKids(e.target.value === "true")}
                        >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>

                    <div className={ui.field}>
                        <label className={ui.label}>Language</label>
                        <select className={ui.input} value={language} onChange={(e) => setLanguage(e.target.value)}>
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                            <option value="Korean">Korean</option>
                            <option value="Japanese">Japanese</option>
                        </select>
                    </div>

                    <div className={ui.field}>
                        <label className={ui.label}>Maturity Level</label>
                        <select className={ui.input} value={maturityLevel} onChange={(e) => setMaturityLevel(e.target.value)}>
                            <option value="All">All</option>
                            <option value="Kids">Kids</option>
                            <option value="Teen">Teen</option>
                            <option value="Adult">Adult</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className={ui.actions}>
                <button className={ui.btnPrimary} onClick={saveProfile}>{selectId ? "Update Profile" : "Save Profile"}</button>
                <button className={ui.btn} onClick={clearForm}>Clear</button>
            </div>

            <h2 className="mt-10 text-xl font-bold">
                All Profiles{" "}
                <span className="ml-1 text-sm font-normal text-muted">
                    ({profiles.length})
                </span>
            </h2>

            <div className={ui.tableWrap}>
                <table className={ui.table}>
                    <thead>
                    <tr>
                        <th className={ui.th}>Name</th>
                        <th className={ui.th}>Avatar Url</th>
                        <th className={ui.th}>Is Kids</th>
                        <th className={ui.th}>Language</th>
                        <th className={ui.th}>Maturity Level</th>
                        <th className={`${ui.th} text-right`}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {profiles.map((profile) => (
                        <tr key={profile._id} className={ui.tr}>
                            <td className={`${ui.td} font-semibold`}>{profile.name}</td>
                            <td className={`${ui.td} text-muted`}>{profile.avatarUrl}</td>
                            <td className={ui.td}>{profile.isKids ? "Yes" : "No"}</td>
                            <td className={ui.td}>{profile.language}</td>
                            <td className={ui.td}>{profile.maturityLevel}</td>
                            <td className={`${ui.td} text-right whitespace-nowrap`}>
                                <button className={ui.btnSm} onClick={ () => editProfile(profile)}>Edit</button>
                                <button className={ui.btnDanger} onClick={ () => deleteProfile(profile._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    {profiles.length === 0 && (
                        <tr>
                            <td colSpan={6} className={ui.empty}>
                                No Profile yet. Create your first one above.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ProfileManagement;