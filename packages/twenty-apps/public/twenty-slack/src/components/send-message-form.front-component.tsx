import {
  type CSSProperties,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  closeSidePanel,
  enqueueSnackbar,
  unmountFrontComponent,
} from 'twenty-sdk/front-component';

import { SEND_MESSAGE_FORM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// Theme tokens are inlined as their CSS-variable values because the SDK mocks
// the UI package during manifest extraction, which would leave an imported
// `odelzaThemeCssVariables` undefined at module level. The values mirror
// `twenty-ui/theme-constants`.
const odelzaThemeCssVariables = {
  spacing: {
    '1': 'var(--odz-spacing-1)',
    '2': 'var(--odz-spacing-2)',
    '3': 'var(--odz-spacing-3)',
    '4': 'var(--odz-spacing-4)',
    '8': 'var(--odz-spacing-8)',
    '20': 'var(--odz-spacing-20)',
  },
  accent: {
    accent4060: 'var(--odz-accent-accent4060)',
  },
  background: {
    primary: 'var(--odz-background-primary)',
    secondary: 'var(--odz-background-secondary)',
  },
  border: {
    color: {
      medium: 'var(--odz-border-color-medium)',
      light: 'var(--odz-border-color-light)',
    },
    radius: {
      sm: 'var(--odz-border-radius-sm)',
    },
  },
  font: {
    color: {
      primary: 'var(--odz-font-color-primary)',
      secondary: 'var(--odz-font-color-secondary)',
      tertiary: 'var(--odz-font-color-tertiary)',
      inverted: 'var(--odz-font-color-inverted)',
      danger: 'var(--odz-font-color-danger)',
    },
    size: {
      xs: 'var(--odz-font-size-xs)',
      sm: 'var(--odz-font-size-sm)',
      md: 'var(--odz-font-size-md)',
    },
    weight: {
      regular: 'var(--odz-font-weight-regular)',
      medium: 'var(--odz-font-weight-medium)',
      semiBold: 'var(--odz-font-weight-semi-bold)',
    },
    family: 'var(--odz-font-family)',
  },
  color: {
    blue: 'var(--odz-color-blue)',
  },
};

type SlackChannel = {
  id: string;
  name: string;
  isPrivate: boolean;
  isArchived: boolean;
  isMember: boolean;
  numMembers: number;
  topic: string;
  purpose: string;
};

type ListChannelsResponse = {
  success: boolean;
  channels?: SlackChannel[];
  error?: string;
  message?: string;
};

type PostMessageResponse = {
  success: boolean;
  slackTs?: string;
  error?: string;
  message?: string;
};

type PostedMessage = {
  channelId: string;
  channelName: string;
  slackTs?: string;
};

type MessageFormat = 'plain' | 'markdown';

const FORMAT_OPTIONS: { value: MessageFormat; label: string }[] = [
  { value: 'plain', label: 'Plain text' },
  { value: 'markdown', label: 'Markdown' },
];

const isMessageFormat = (value: string): value is MessageFormat =>
  value === 'plain' || value === 'markdown';

const readSerializedValue = (
  event: SyntheticEvent<HTMLElement>,
): string | undefined => {
  const object = event as {
    detail?: { value?: string };
    value?: string;
    target?: { value?: string };
  };

  if (typeof object.detail?.value === 'string') {
    return object.detail.value;
  }
  if (typeof object.value === 'string') {
    return object.value;
  }
  if (typeof object.target?.value === 'string') {
    return object.target.value;
  }

  return undefined;
};

const onValueChange =
  (setValue: (value: string) => void) =>
  (event: SyntheticEvent<HTMLElement>) => {
    const value = readSerializedValue(event);

    if (typeof value === 'string') {
      setValue(value);
    }
  };

const callAppRoute = async <TResponse,>(
  path: string,
  method: 'GET' | 'POST',
  body?: Record<string, unknown>,
): Promise<TResponse> => {
  const apiBaseUrl = process.env.TWENTY_API_URL;
  const token =
    process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY;

  if (!apiBaseUrl || !token) {
    throw new Error('App is missing API URL or access token configuration.');
  }

  const response = await fetch(`${apiBaseUrl}/s${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');

    let errorMessage: string | undefined;

    try {
      const parsed = JSON.parse(text) as {
        messages?: string[];
        message?: string;
        error?: string;
      };

      errorMessage = parsed.messages?.[0] ?? parsed.message ?? parsed.error;
    } catch {
      // Body is not JSON; fall through to raw text or status message.
    }

    throw new Error(
      errorMessage ??
        (text.length > 0
          ? text.slice(0, 200)
          : `Request failed with status ${response.status}.`),
    );
  }

  return response.json() as Promise<TResponse>;
};

const sortChannels = (channels: SlackChannel[]): SlackChannel[] =>
  [...channels].sort((a, b) => {
    if (a.isMember !== b.isMember) {
      return a.isMember ? -1 : 1;
    }

    return a.name.localeCompare(b.name);
  });

const formatChannelOptionLabel = (channel: SlackChannel): string => {
  const prefix = channel.isPrivate ? '🔒' : '#';
  const suffix = channel.isMember ? '' : ' — bot is not a member';

  return `${prefix} ${channel.name}${suffix}`;
};

const getChannelHelperText = (
  selectedChannel: SlackChannel | undefined,
): string => {
  if (selectedChannel === undefined) {
    return 'Pick a channel to post to.';
  }

  if (selectedChannel.isMember) {
    return selectedChannel.isPrivate
      ? 'Private channel · bot is a member.'
      : 'Public channel · bot is a member.';
  }

  return 'Bot is not a member of this channel — it must be invited before it can post.';
};

const getStyles = (): Record<string, CSSProperties> => ({
  container: {
    fontFamily: odelzaThemeCssVariables.font.family,
    fontSize: odelzaThemeCssVariables.font.size.sm,
    color: odelzaThemeCssVariables.font.color.primary,
    background: odelzaThemeCssVariables.background.primary,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
  },
  header: {
    padding: odelzaThemeCssVariables.spacing[4],
    borderBottom: `1px solid ${odelzaThemeCssVariables.border.color.light}`,
    flexShrink: 0,
  },
  headerTitleBlock: {
    marginBottom: odelzaThemeCssVariables.spacing[4],
  },
  pageTitle: {
    fontSize: odelzaThemeCssVariables.font.size.md,
    fontWeight: odelzaThemeCssVariables.font.weight.semiBold,
    color: odelzaThemeCssVariables.font.color.primary,
    margin: 0,
  },
  pageSubtitle: {
    fontSize: odelzaThemeCssVariables.font.size.md,
    fontWeight: odelzaThemeCssVariables.font.weight.regular,
    color: odelzaThemeCssVariables.font.color.tertiary,
    margin: 0,
    marginTop: odelzaThemeCssVariables.spacing[2],
    lineHeight: 1.5,
  },
  body: {
    flex: 1,
    minHeight: 0,
    padding: odelzaThemeCssVariables.spacing[4],
    display: 'flex',
    flexDirection: 'column',
    gap: odelzaThemeCssVariables.spacing[4],
    overflowY: 'auto',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: odelzaThemeCssVariables.spacing[1],
  },
  fieldGrowing: {
    display: 'flex',
    flexDirection: 'column',
    gap: odelzaThemeCssVariables.spacing[1],
    flex: 1,
    minHeight: 0,
  },
  label: {
    fontSize: odelzaThemeCssVariables.font.size.xs,
    fontWeight: odelzaThemeCssVariables.font.weight.medium,
    color: odelzaThemeCssVariables.font.color.secondary,
  },
  helperText: {
    fontSize: odelzaThemeCssVariables.font.size.xs,
    color: odelzaThemeCssVariables.font.color.tertiary,
  },
  select: {
    appearance: 'none',
    WebkitAppearance: 'none',
    background: odelzaThemeCssVariables.background.secondary,
    border: `1px solid ${odelzaThemeCssVariables.border.color.medium}`,
    borderRadius: odelzaThemeCssVariables.border.radius.sm,
    padding: `${odelzaThemeCssVariables.spacing[2]} ${odelzaThemeCssVariables.spacing[3]}`,
    color: odelzaThemeCssVariables.font.color.primary,
    fontSize: odelzaThemeCssVariables.font.size.sm,
    fontFamily: odelzaThemeCssVariables.font.family,
    height: odelzaThemeCssVariables.spacing[8],
    cursor: 'pointer',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  textarea: {
    background: odelzaThemeCssVariables.background.secondary,
    border: `1px solid ${odelzaThemeCssVariables.border.color.medium}`,
    borderRadius: odelzaThemeCssVariables.border.radius.sm,
    padding: odelzaThemeCssVariables.spacing[3],
    color: odelzaThemeCssVariables.font.color.primary,
    fontSize: odelzaThemeCssVariables.font.size.sm,
    fontFamily: odelzaThemeCssVariables.font.family,
    lineHeight: 1.5,
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    resize: 'none',
    flex: 1,
    minHeight: odelzaThemeCssVariables.spacing[20],
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: odelzaThemeCssVariables.spacing[2],
    padding: odelzaThemeCssVariables.spacing[3],
    borderTop: `1px solid ${odelzaThemeCssVariables.border.color.light}`,
    flexShrink: 0,
  },
  buttonBase: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: odelzaThemeCssVariables.spacing[1],
    height: odelzaThemeCssVariables.spacing[8],
    padding: `0 ${odelzaThemeCssVariables.spacing[3]}`,
    borderRadius: odelzaThemeCssVariables.border.radius.sm,
    fontSize: odelzaThemeCssVariables.font.size.sm,
    fontFamily: odelzaThemeCssVariables.font.family,
    fontWeight: odelzaThemeCssVariables.font.weight.medium,
    cursor: 'pointer',
    border: '1px solid transparent',
    boxSizing: 'border-box',
  },
  secondaryButton: {
    background: odelzaThemeCssVariables.background.secondary,
    color: odelzaThemeCssVariables.font.color.secondary,
    border: `1px solid ${odelzaThemeCssVariables.border.color.medium}`,
  },
  primaryButton: {
    background: odelzaThemeCssVariables.color.blue,
    color: odelzaThemeCssVariables.font.color.inverted,
  },
  primaryButtonDisabled: {
    background: odelzaThemeCssVariables.accent.accent4060,
    cursor: 'not-allowed',
  },
  centeredState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: odelzaThemeCssVariables.spacing[4],
    height: '100%',
    boxSizing: 'border-box',
  },
  stateBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: odelzaThemeCssVariables.spacing[3],
    maxWidth: '320px',
    textAlign: 'center',
  },
  stateTitle: {
    fontSize: odelzaThemeCssVariables.font.size.md,
    fontWeight: odelzaThemeCssVariables.font.weight.medium,
    color: odelzaThemeCssVariables.font.color.primary,
    margin: 0,
  },
  stateDescription: {
    fontSize: odelzaThemeCssVariables.font.size.sm,
    color: odelzaThemeCssVariables.font.color.tertiary,
    margin: 0,
    lineHeight: 1.5,
  },
  stateError: {
    fontSize: odelzaThemeCssVariables.font.size.sm,
    color: odelzaThemeCssVariables.font.color.danger,
    margin: 0,
    lineHeight: 1.5,
  },
});

const SendMessageForm = () => {
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(true);
  const [channelsError, setChannelsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [postedMessage, setPostedMessage] = useState<PostedMessage | null>(
    null,
  );

  const [channelId, setChannelId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messageFormat, setMessageFormat] = useState<MessageFormat>('markdown');

  const styles = getStyles();

  const fetchChannels = useCallback(async () => {
    try {
      setChannelsError(null);
      setChannelsLoading(true);

      const result = await callAppRoute<ListChannelsResponse>(
        '/slack/channels?limit=200',
        'GET',
      );

      if (!result.success) {
        setChannelsError(
          result.error ?? result.message ?? 'Failed to load Slack channels.',
        );

        return;
      }

      const sorted = sortChannels(result.channels ?? []);

      setChannels(sorted);

      const firstMemberChannel = sorted.find((channel) => channel.isMember);

      if (firstMemberChannel !== undefined) {
        setChannelId(firstMemberChannel.id);
      } else if (sorted.length === 1) {
        setChannelId(sorted[0].id);
      }
    } catch (error) {
      setChannelsError(
        error instanceof Error
          ? error.message
          : 'Failed to load Slack channels.',
      );
    } finally {
      setChannelsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const handleClose = () => {
    unmountFrontComponent();
    closeSidePanel();
  };

  const handleSendAnother = () => {
    setMessageText('');
    setPostedMessage(null);
  };

  const handleSubmit = async () => {
    const trimmedMessage = messageText.trim();

    if (channelId === '' || trimmedMessage === '') {
      return;
    }

    setSubmitting(true);

    try {
      const result = await callAppRoute<PostMessageResponse>(
        '/slack/messages',
        'POST',
        {
          slackChannelId: channelId,
          messageText: trimmedMessage,
          messageFormat,
        },
      );

      if (!result.success) {
        await enqueueSnackbar({
          message:
            result.error ?? result.message ?? 'Failed to send Slack message.',
          variant: 'error',
        });

        return;
      }

      const channel = channels.find(
        (channelItem) => channelItem.id === channelId,
      );

      setPostedMessage({
        channelId,
        channelName: channel?.name ?? channelId,
        slackTs: result.slackTs,
      });

      await enqueueSnackbar({
        message: `Message sent to #${channel?.name ?? channelId}`,
        variant: 'success',
      });
    } catch (error) {
      await enqueueSnackbar({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to send Slack message.',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (channelsLoading) {
    return (
      <div style={styles.centeredState}>
        <div style={styles.stateBlock}>
          <h2 style={styles.stateTitle}>Loading channels…</h2>
          <p style={styles.stateDescription}>
            Fetching the list of Slack channels your bot can post to.
          </p>
        </div>
      </div>
    );
  }

  if (channelsError !== null) {
    return (
      <div style={styles.centeredState}>
        <div style={styles.stateBlock}>
          <h2 style={styles.stateTitle}>Couldn't load channels</h2>
          <p style={styles.stateError}>{channelsError}</p>
          <button
            type="button"
            style={{ ...styles.buttonBase, ...styles.secondaryButton }}
            onClick={fetchChannels}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div style={styles.centeredState}>
        <div style={styles.stateBlock}>
          <h2 style={styles.stateTitle}>No channels available</h2>
          <p style={styles.stateDescription}>
            The bot doesn't have access to any Slack channels yet. Invite it to
            a channel and try again.
          </p>
          <button
            type="button"
            style={{ ...styles.buttonBase, ...styles.secondaryButton }}
            onClick={fetchChannels}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  if (postedMessage !== null) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerTitleBlock}>
            <h2 style={styles.pageTitle}>Message sent</h2>
            <p style={styles.pageSubtitle}>
              {`Posted to #${postedMessage.channelName}.`}
            </p>
          </div>
        </div>
        <div style={styles.body}>
          <p style={styles.stateDescription}>
            Your message is now visible in Slack.
          </p>
        </div>
        <div style={styles.footer}>
          <button
            type="button"
            style={{ ...styles.buttonBase, ...styles.secondaryButton }}
            onClick={handleClose}
          >
            Close
          </button>
          <button
            type="button"
            style={{ ...styles.buttonBase, ...styles.primaryButton }}
            onClick={handleSendAnother}
          >
            Send another
          </button>
        </div>
      </div>
    );
  }

  const trimmedMessage = messageText.trim();
  const canSubmit = channelId !== '' && trimmedMessage !== '' && !submitting;
  const selectedChannel = channels.find(
    (channelItem) => channelItem.id === channelId,
  );
  const channelHelperText = getChannelHelperText(selectedChannel);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTitleBlock}>
          <h2 style={styles.pageTitle}>Send Slack message</h2>
          <p style={styles.pageSubtitle}>
            Post a message to any channel your bot has access to.
          </p>
        </div>
      </div>

      <div style={styles.body}>
        <div style={styles.field}>
          <label htmlFor="slack-channel-select" style={styles.label}>
            Channel
          </label>
          <select
            id="slack-channel-select"
            value={channelId}
            onChange={onValueChange(setChannelId)}
            style={styles.select}
            disabled={submitting}
          >
            <option value="" disabled>
              Select a channel…
            </option>
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {formatChannelOptionLabel(channel)}
              </option>
            ))}
          </select>
          <span style={styles.helperText}>{channelHelperText}</span>
        </div>

        <div style={styles.field}>
          <label htmlFor="slack-message-format-select" style={styles.label}>
            Format
          </label>
          <select
            id="slack-message-format-select"
            value={messageFormat}
            onChange={onValueChange((value) => {
              if (isMessageFormat(value)) {
                setMessageFormat(value);
              }
            })}
            style={styles.select}
            disabled={submitting}
          >
            {FORMAT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span style={styles.helperText}>
            {messageFormat === 'markdown'
              ? 'Markdown is rendered using Slack mrkdwn (bold, italics, code, links).'
              : 'The message will be sent exactly as written, with no formatting.'}
          </span>
        </div>

        <div style={styles.fieldGrowing}>
          <label htmlFor="slack-message-textarea" style={styles.label}>
            Message
          </label>
          <textarea
            id="slack-message-textarea"
            value={messageText}
            onInput={onValueChange(setMessageText)}
            onChange={onValueChange(setMessageText)}
            placeholder="Write your message…"
            style={styles.textarea}
            disabled={submitting}
          />
        </div>
      </div>

      <div style={styles.footer}>
        <button
          type="button"
          style={{ ...styles.buttonBase, ...styles.secondaryButton }}
          onClick={handleClose}
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="button"
          style={{
            ...styles.buttonBase,
            ...styles.primaryButton,
            ...(canSubmit ? {} : styles.primaryButtonDisabled),
          }}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {submitting ? 'Sending…' : 'Send message'}
        </button>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: SEND_MESSAGE_FORM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'send-slack-message-form',
  description:
    'Form to send a Slack message to any channel the bot can post to, with plain-text or markdown formatting.',
  component: SendMessageForm,
});
