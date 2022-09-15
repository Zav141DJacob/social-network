import styles from './topbar.module.css'

export function TopBar() {
  return (
    <div className={styles.topbar}>
    <div className={styles.logo}>Meetup</div>
    <div className={styles.notifications}>Notifications</div>
    </div>
  )
}
