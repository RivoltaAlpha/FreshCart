import React from 'react'
import { useUpdateUser } from '@/hooks/useUser'

interface DriverStatusToggleProps {
    driverId: number
    is_available: boolean
}

const DriverStatusToggle: React.FC<DriverStatusToggleProps> = ({ driverId, is_available }) => {
    const user = JSON.parse(localStorage.getItem('auth') || '{}')
    const availability = user?.is_available ? 'Available' : 'Unavailable';
    const [checked, setChecked] = React.useState(availability === 'Available');
    const updateUser = useUpdateUser(driverId)

    // Sync local state with prop changes
    React.useEffect(() => {
        setChecked(availability === 'Available');
    }, [is_available])

    const handleToggle = () => {
        updateUser.mutate({ is_available: !checked })
        setChecked((prev) => !prev)
    }

    return (
        <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ marginRight: 8 }}>{checked ? 'Available' : 'Unavailable'}</span>
            <span style={{ position: 'relative', display: 'inline-block', width: 40, height: 22 }}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={handleToggle}
                    style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                    style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: checked ? '#4ade80' : '#ccc',
                        borderRadius: 22,
                        transition: 'background 0.2s',
                    }}
                />
                <span
                    style={{
                        position: 'absolute',
                        left: checked ? 20 : 2,
                        top: 2,
                        width: 18,
                        height: 18,
                        background: '#fff',
                        borderRadius: '50%',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                />
            </span>
        </label>
    )
}

export default DriverStatusToggle