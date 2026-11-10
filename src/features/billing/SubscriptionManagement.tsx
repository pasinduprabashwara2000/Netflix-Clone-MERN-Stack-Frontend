import { useEffect, useState } from "react";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/common/Pagination";
import { planApi, subscriptionApi, userApi } from "../../services/api";
import { ui } from "../../lib/ui";
import type { Plan, Subscription, User } from "../../services/api";
import { useAlert } from "../../alerts/context";

const statusColor: Record<string, "green" | "amber" | "red" | "gray"> = {
  Active: "green",
  Pending: "amber",
  Cancelled: "red",
  Expired: "gray",
};

const dateOnly = (iso: string) => (iso ? iso.slice(0, 10) : "-");

function SubscriptionManagement() {
  const { success, error } = useAlert();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const pager = usePagination(subscriptions);
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [status, setStatus] = useState("Active");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load all data
  const loadAll = async () => {
    try {
      setLoading(true);

      const [subscriptionData, userData, planData] = await Promise.all([
        subscriptionApi.getAll(),
        userApi.getAll(),
        planApi.getAll(),
      ]);

      setSubscriptions(subscriptionData);
      setUsers(userData);
      setPlans(planData);
    } catch (e) {
      error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Select subscription for editing
  const editSubscription = (subscription: Subscription) => {
    setSelectedId(subscription._id);
    setStatus(subscription.status);
  };

  // Clear selection
  const clearForm = () => {
    setSelectedId("");
    setStatus("Active");
  };

  // Update subscription status
  const updateSubscription = async () => {
    if (!selectedId) {
      error("Please select a subscription first.");
      return;
    }

    try {
      setSaving(true);

      await subscriptionApi.update(selectedId, {
        status,
      });

      success("Subscription status updated successfully.");

      clearForm();
      await loadAll();

    } catch (e) {
      error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Get user email
  const userLabel = (id: string) =>
      users.find((user) => user._id === id)?.email ?? id;

  // Get plan name
  const planLabel = (id: string) =>
      plans.find((plan) => plan._id === id)?.name ?? id;

  return (
      <div className={ui.page}>
        <h1 className={ui.title}>Manage Subscriptions</h1>
        <p className={ui.subtitle}>
          View user subscriptions and manage their subscription status.
        </p>

        {/* Edit Subscription */}
        <div className={ui.card}>
          <h2 className={ui.cardTitle}>Update Subscription Status</h2>

          <div className={ui.grid}>

            <div className={ui.field}>
              <label className={ui.label}>Status</label>
              <select className={ui.input} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          <div className={ui.actions}>
            <button className={ui.btnPrimary} onClick={updateSubscription} disabled={!selectedId || saving}>{saving ? "Updating..." : "Update Status"}</button>
            <button className={ui.btn} onClick={clearForm} disabled={saving}>Clear</button>
          </div>
        </div>

        {/* Subscription Table */}
        <h2 className="mt-8 text-xl font-bold">
          All Subscriptions
          <span className="ml-2 text-sm font-normal text-muted">({subscriptions.length})</span>
        </h2>

        <div className={ui.tableWrap}>
          <table className={ui.table}>
            <thead>
            <tr>
              <th className={ui.th}>User</th>
              <th className={ui.th}>Plan</th>
              <th className={ui.th}>Status</th>
              <th className={ui.th}>Period</th>
              <th className={ui.th}>Payment Ref</th>
              <th className={`${ui.th} text-right`}>Actions</th>
            </tr>
            </thead>

            <tbody>
            {loading ? (
                <tr>
                  <td colSpan={6} className={ui.empty}>
                    Loading subscriptions...
                  </td>
                </tr>
            ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className={ui.empty}>
                    No subscriptions found.
                  </td>
                </tr>
            ) : (
                pager.items.map((s) => (
                    <tr key={s._id} className={ui.tr}>
                      <td className={`${ui.td} font-semibold`}>
                        {userLabel(s.userId)}
                      </td>

                      <td className={ui.td}>
                        {planLabel(s.planId)}
                      </td>

                      <td className={ui.td}>
                            <span className={ui.badge(statusColor[s.status] ?? "gray")}>{s.status}</span>
                      </td>

                      <td className={`${ui.td} whitespace-nowrap text-muted`}>
                        {dateOnly(s.startDate)} → {dateOnly(s.endDate)}
                      </td>

                      <td className={`${ui.td} font-mono text-xs text-muted`}>
                        {s.paymentRef || "-"}
                      </td>

                      <td className={`${ui.td} text-right whitespace-nowrap`}>
                        <button className={ui.btnSm} onClick={() => editSubscription(s)}>Edit Status</button>
                      </td>
                    </tr>
                ))
            )}
            </tbody>
          </table>
        </div>

            <Pagination pager={pager} />
      </div>
  );
}

export default SubscriptionManagement;
