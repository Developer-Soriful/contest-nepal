import type { Href } from "expo-router";

type NotificationRecord = Record<string, any>;

export interface NotificationRouteInput {
  id?: string;
  title?: string;
  body?: string;
  type?: string;
  timestamp?: string;
  data?: NotificationRecord;
}

export interface NotificationRouteTarget {
  href: Href;
  actionLabel: string;
  source: string;
  kind: "direct" | "detail";
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const firstString = (...values: unknown[]) => {
  for (const value of values) {
    if (isNonEmptyString(value)) {
      return value.trim();
    }
  }
  return undefined;
};

export const normalizeNotificationType = (value?: string) => {
  switch (value) {
    case "CONTEST_UPDATE":
    case "contest":
      return "contest";
    case "WINNER_ALERT":
    case "win":
    case "REWARD":
    case "prize":
    case "reward":
    case "giveaway":
      return "prize";
    case "entry":
      return "entry";
    case "announcement":
      return "announcement";
    case "reminder":
      return "reminder";
    default:
      return "system";
  }
};

export const getNotificationId = (input: NotificationRouteInput) =>
  firstString(
    input.id,
    input.data?.notificationId,
    input.data?.id,
    input.data?._id
  );

export const getNotificationContestId = (input: NotificationRouteInput) =>
  firstString(
    input.data?.contestId,
    input.data?.contest?._id,
    input.data?.contest?.id,
    input.data?.context?.contestId
  );

export const getNotificationEntryId = (input: NotificationRouteInput) =>
  firstString(
    input.data?.entryId,
    input.data?.submissionId,
    input.data?.context?.entryId
  );

const getNotificationPath = (input: NotificationRouteInput) =>
  firstString(input.data?.path, input.data?.url, input.data?.route);

const mapBackendPathToHref = (path: string): Href | undefined => {
  const normalizedPath = path.trim();

  if (!normalizedPath.startsWith("/")) {
    return undefined;
  }

  const contestMatch = normalizedPath.match(/^\/contests\/([^/?#]+)/i);
  if (contestMatch?.[1]) {
    return {
      pathname: "/contest-detail",
      params: { contestId: contestMatch[1] },
    };
  }

  if (/^\/dashboard\/?$/.test(normalizedPath)) {
    return "/dashboard";
  }

  if (/^\/notifications\/?$/.test(normalizedPath)) {
    return "/notifications";
  }

  if (/^\/activities\/?$/.test(normalizedPath)) {
    return "/all-activities";
  }

  return undefined;
};

export const buildNotificationDetailHref = (
  input: NotificationRouteInput,
  actionLabel = "Open Notification"
): Href => {
  const normalizedType = normalizeNotificationType(
    firstString(input.data?.type, input.type)
  );

  return {
    pathname: "/notification-detail",
    params: {
      id: getNotificationId(input) || "",
      title: input.title || "Notification",
      message: input.body || "",
      time: input.timestamp || new Date().toISOString(),
      category: normalizedType,
      source: firstString(input.data?.source, input.data?.senderRole) || "system",
      actionLabel,
      data: JSON.stringify(input.data || {}),
    },
  };
};

export const resolveNotificationTarget = (
  input: NotificationRouteInput
): NotificationRouteTarget => {
  const normalizedType = normalizeNotificationType(
    firstString(input.data?.type, input.type)
  );
  const source =
    firstString(input.data?.source, input.data?.senderRole) || "system";
  const contestId = getNotificationContestId(input);
  const entryId = getNotificationEntryId(input);
  const explicitPath = getNotificationPath(input);

  if (explicitPath) {
    const explicitHref = mapBackendPathToHref(explicitPath);
    if (explicitHref) {
      return {
        href: explicitHref,
        actionLabel: contestId ? "View Contest" : "Open",
        source,
        kind: "direct",
      };
    }
  }

  if (contestId) {
    return {
      href: {
        pathname: "/contest-detail",
        params: { contestId },
      },
      actionLabel:
        normalizedType === "entry" ? "View Contest Update" : "View Contest",
      source,
      kind: "direct",
    };
  }

  if (entryId) {
    return {
      href: "/all-activities",
      actionLabel: "View Activity",
      source,
      kind: "direct",
    };
  }

  if (normalizedType === "prize") {
    return {
      href: "/dashboard",
      actionLabel: "Open Dashboard",
      source,
      kind: "direct",
    };
  }

  if (normalizedType === "entry") {
    return {
      href: "/all-activities",
      actionLabel: "View Activity",
      source,
      kind: "direct",
    };
  }

  return {
    href: buildNotificationDetailHref(input),
    actionLabel: "View Details",
    source,
    kind: "detail",
  };
};
