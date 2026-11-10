import { useEffect, useState } from "react";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/common/Pagination";
import { ui } from "../../lib/ui";
import { profileApi, userApi } from "../../services/api";
import type { Profile, User } from "../../services/api";
import { useAlert } from "../../alerts/context";

function ProfileManagement() {
    const { error } = useAlert();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

    const getUserId = (profile: Profile): string => {
        const raw = profile.userId as unknown;
        return typeof raw === "object" && raw !== null
            ? (raw as { _id: string })._id
            : raw as string;
    };

    const getUser = (profile: Profile) =>
        users.find((user) => user._id === getUserId(profile));

    const loadData = async () => {
        try {
            setLoading(true);
            const [profileData, userData] = await Promise.all([
                profileApi.getAll(),
                userApi.getAll()
            ]);
            setProfiles(profileData);
            setUsers(userData);
        } catch (err) {
            error((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredProfiles = profiles.filter((profile) => {
        const user = getUser(profile);
        const value = search.toLowerCase();
        return (
            profile.name.toLowerCase().includes(value) ||
            profile.language.toLowerCase().includes(value) ||
            profile.maturityLevel.toLowerCase().includes(value) ||
            (user?.name || "").toLowerCase().includes(value) ||
            (user?.email || "").toLowerCase().includes(value)
        );
    });

    const pager = usePagination(filteredProfiles, search);

    const kidsCount = profiles.filter((p) => p.isKids).length;

    return (
        <div className={ui.page}>
            <div>
                <h1 className={ui.title}>Profile Management</h1>
                <p className={ui.subtitle}>View and monitor customer profiles.</p>
            </div>

            {/* Statistics */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border border-line bg-panel p-3">
                    <p className={ui.statLabel}>Total Profiles</p>
                    <h2 className="mt-1 text-2xl font-bold">{profiles.length}</h2>
                </div>
                <div className="rounded-lg border border-line bg-panel p-3">
                    <p className={ui.statLabel}>Kids Profiles</p>
                    <h2 className="mt-1 text-2xl font-bold">{kidsCount}</h2>
                </div>
                <div className="rounded-lg border border-line bg-panel p-3">
                    <p className={ui.statLabel}>Regular Profiles</p>
                    <h2 className="mt-1 text-2xl font-bold">{profiles.length - kidsCount}</h2>
                </div>
            </div>

            {/* Search */}
            <div className="mt-4">
                <input type="text" className={ui.input} placeholder="Search by profile name, user, email or language..." value={search} onChange={(e) => setSearch(e.target.value)}/>
            </div>

            {/* Profiles Table */}
            <div className="mt-5">
                <h2 className="mb-2 text-lg font-bold">
                    All Profiles <span className="text-sm font-normal text-muted">({filteredProfiles.length})</span>
                </h2>
                <div className={ui.tableWrap}>
                    <table className={ui.table}>
                        <thead>
                        <tr>
                            <th className={ui.th}>Profile</th>
                            <th className={ui.th}>Account Owner</th>
                            <th className={ui.th}>Kids</th>
                            <th className={ui.th}>Language</th>
                            <th className={ui.th}>Maturity</th>
                            <th className={`${ui.th} text-right`}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className={ui.empty}>Loading profiles...</td></tr>
                        ) : filteredProfiles.length === 0 ? (
                            <tr><td colSpan={6} className={ui.empty}>No profiles found.</td></tr>
                        ) : (
                            pager.items.map((profile) => {
                                const user = getUser(profile);
                                return (
                                    <tr key={profile._id} className={ui.tr}>
                                        <td className={ui.td}>
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={profile.avatarUrl}
                                                    alt={profile.name}
                                                    className={ui.avatar}
                                                    onError={(e) => {
                                                        e.currentTarget.style.visibility = "hidden";
                                                    }}
                                                />
                                                <span className="font-medium">{profile.name}</span>
                                            </div>
                                        </td>
                                        <td className={ui.td}>
                                            <p className="font-medium">{user?.name || "Unknown"}</p>
                                            <p className="text-xs text-muted">{user?.email || "N/A"}</p>
                                        </td>
                                        <td className={ui.td}>
                                                <span className={ui.badge(profile.isKids ? "blue" : "green")}>
                                                    {profile.isKids ? "Yes" : "No"}
                                                </span>
                                        </td>
                                        <td className={ui.td}>{profile.language}</td>
                                        <td className={ui.td}>
                                            <span className={ui.badge("gray")}>{profile.maturityLevel}</span>
                                        </td>
                                        <td className={`${ui.td} text-right`}>
                                            <button className={ui.btnSm} onClick={() => setSelectedProfile(profile)}>
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>

            <Pagination pager={pager} />
            </div>

            {/* Profile Details */}
            {selectedProfile && (
                <div className="mt-5 rounded-xl border border-line bg-panel p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="font-bold">Profile Details</h2>
                        <button className={ui.btnSm} onClick={() => setSelectedProfile(null)}>Close</button>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <img src={selectedProfile.avatarUrl} alt={selectedProfile.name} className={ui.avatarLg} />
                        <div>
                            <h3 className="font-semibold">{selectedProfile.name}</h3>
                            <p className="text-xs text-muted">{getUser(selectedProfile)?.email || "Unknown"}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className={ui.detailItem}>
                            <p className={ui.detailLabel}>Account Owner</p>
                            <p className={ui.detailValue}>{getUser(selectedProfile)?.name || "Unknown"}</p>
                        </div>
                        <div className={ui.detailItem}>
                            <p className={ui.detailLabel}>Kids Profile</p>
                            <p className={ui.detailValue}>{selectedProfile.isKids ? "Yes" : "No"}</p>
                        </div>
                        <div className={ui.detailItem}>
                            <p className={ui.detailLabel}>Language</p>
                            <p className={ui.detailValue}>{selectedProfile.language}</p>
                        </div>
                        <div className={ui.detailItem}>
                            <p className={ui.detailLabel}>Maturity</p>
                            <p className={ui.detailValue}>{selectedProfile.maturityLevel}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProfileManagement;
