import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#991b1b', height: '100vh', fontFamily: 'sans-serif' }}>
                    <h1>⚠️ Something went wrong.</h1>
                    <p>The application crashed with the following error:</p>
                    <pre style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '5px', overflow: 'auto' }}>
                        {this.state.error?.toString()}
                    </pre>
                    <p>Component Stack:</p>
                    <pre style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '12px' }}>
                        {this.state.errorInfo?.componentStack}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#b91c1c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
