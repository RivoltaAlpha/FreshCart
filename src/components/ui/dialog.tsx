import * as React from "react"
import { X } from "lucide-react"

interface DialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    children: React.ReactNode
}

interface DialogContentProps {
    children: React.ReactNode
    className?: string
}

interface DialogHeaderProps {
    children: React.ReactNode
    className?: string
}

interface DialogTitleProps {
    children: React.ReactNode
    className?: string
}

interface DialogDescriptionProps {
    children: React.ReactNode
    className?: string
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onOpenChange(false)
            }
        }

        if (open) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [open, onOpenChange])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />
            <div className="relative z-50 w-full max-w-2xl mx-4">
                {children}
            </div>
        </div>
    )
}

const DialogContent: React.FC<DialogContentProps> = ({ children, className = "" }) => (
    <div className={`bg-background border border-border rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto ${className}`}>
        {children}
    </div>
)

const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className = "" }) => (
    <div className={`mb-4 ${className}`}>
        {children}
    </div>
)

const DialogTitle: React.FC<DialogTitleProps> = ({ children, className = "" }) => (
    <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
        {children}
    </h2>
)

const DialogDescription: React.FC<DialogDescriptionProps> = ({ children, className = "" }) => (
    <p className={`text-sm text-muted-foreground mt-2 ${className}`}>
        {children}
    </p>
)

const DialogClose: React.FC<{ onClick: () => void; className?: string }> = ({
    onClick,
    className = ""
}) => (
    <button
        onClick={onClick}
        className={`absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none ${className}`}
    >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
    </button>
)

export {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogClose,
}
