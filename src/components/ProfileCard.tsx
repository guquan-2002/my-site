import { useEffect, useState } from 'react';

interface Account {
  label: string;
  url: string;
}

interface Profile {
  displayName?: string;
  pronunciation?: string;
  description?: string;
  email?: string;
  profileUrl?: string;
  avatarPath?: string;
  avatarAlt?: string;
  github?: Account;
  x?: Account;
}

export default function ProfileCard({ profile }: { profile: Profile }) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    if (copyState === 'idle') return;
    const timeout = window.setTimeout(() => setCopyState('idle'), 2200);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  async function copyEmail() {
    if (!profile.email) return;
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  }

  const accounts = [profile.x, profile.github].filter(
    (account): account is Account => Boolean(account?.url),
  );

  return (
    <section className="profile" aria-labelledby="profile-name">
      <div className="profile__words">
        <div className="profile__identity">
          {profile.displayName && <h1 id="profile-name">{profile.displayName}</h1>}
          {profile.pronunciation && (
            <p className="profile__pronunciation">{profile.pronunciation}</p>
          )}
        </div>

        {profile.description && (
          <p className="profile__description">{profile.description}</p>
        )}

        <div className="profile__contact" id="contact" aria-label="联系方式">
          {profile.email && (
            <div className="email-actions">
              <a className="contact-link contact-link--primary" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
              <button className="copy-email" type="button" onClick={copyEmail}>
                {copyState === 'copied'
                  ? '已复制'
                  : copyState === 'failed'
                    ? '未复制'
                    : '复制'}
              </button>
            </div>
          )}

          {(accounts.length > 0 || profile.profileUrl) && (
            <nav className="profile__links" aria-label="外部主页">
              {accounts.map((account) => (
                <a
                  className="contact-link"
                  href={account.url}
                  key={account.url}
                  rel="me noreferrer noopener"
                  target="_blank"
                >
                  {account.label}
                  <span aria-hidden="true"> ↗</span>
                </a>
              ))}
              {profile.profileUrl && (
                <a
                  className="contact-link"
                  href={profile.profileUrl}
                  rel="me noreferrer noopener"
                  target="_blank"
                >
                  Gravatar<span aria-hidden="true"> ↗</span>
                </a>
              )}
            </nav>
          )}
        </div>
      </div>

      {profile.avatarPath && (
        <div className="profile__portrait" aria-hidden={!profile.avatarAlt}>
          <img
            src={profile.avatarPath}
            width="256"
            height="256"
            alt={profile.avatarAlt || ''}
          />
        </div>
      )}
    </section>
  );
}
