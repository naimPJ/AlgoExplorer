import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from './AuthContext';
import { useAuth } from './useAuth';

const jsonResponse = (status, body) => ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
});

// Small harness that exposes AuthContext state/actions as clickable buttons
// so tests can drive them through RTL instead of reaching into internals.
const Harness = () => {
    const { user, login, register, logout, getToken, loginWithToken } = useAuth();
    return (
        <div>
            <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
            <div data-testid="token">{getToken() ?? 'null'}</div>
            <button onClick={() => login('a@example.com', 'password123').then((err) => {
                document.getElementById('error').textContent = err ?? '';
            })}>login</button>
            <button onClick={() => register('name', 'a@example.com', 'password123', 'IBU').then((err) => {
                document.getElementById('error').textContent = err ?? '';
            })}>register</button>
            <button onClick={() => loginWithToken('sso-token', { id: 9, username: 'sso' })}>loginWithToken</button>
            <button onClick={logout}>logout</button>
            <div id="error" data-testid="error" />
        </div>
    );
};

const renderHarness = () => render(<AuthProvider><Harness /></AuthProvider>);

beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn();
});

describe('AuthContext', () => {
    it('login stores the token/session and updates user on success', async () => {
        global.fetch.mockResolvedValueOnce(
            jsonResponse(200, { token: 'abc123', user: { id: 1, username: 'a' } })
        );
        const user = userEvent.setup();
        renderHarness();

        await user.click(screen.getByText('login'));

        await waitFor(() => {
            expect(screen.getByTestId('user').textContent).toBe(JSON.stringify({ id: 1, username: 'a' }));
        });
        expect(localStorage.getItem('ae_token')).toBe('abc123');
        expect(JSON.parse(localStorage.getItem('ae_session'))).toEqual({ id: 1, username: 'a' });
    });

    it('login returns the server error and does not set user on failure', async () => {
        global.fetch.mockResolvedValueOnce(jsonResponse(401, { error: 'Invalid email or password.' }));
        const user = userEvent.setup();
        renderHarness();

        await user.click(screen.getByText('login'));

        await waitFor(() => {
            expect(screen.getByTestId('error').textContent).toBe('Invalid email or password.');
        });
        expect(screen.getByTestId('user').textContent).toBe('null');
        expect(localStorage.getItem('ae_token')).toBeNull();
    });

    it('register stores the token/session and updates user on success', async () => {
        global.fetch.mockResolvedValueOnce(
            jsonResponse(201, { token: 'xyz789', user: { id: 2, username: 'name' } })
        );
        const user = userEvent.setup();
        renderHarness();

        await user.click(screen.getByText('register'));

        await waitFor(() => {
            expect(screen.getByTestId('user').textContent).toBe(JSON.stringify({ id: 2, username: 'name' }));
        });
        expect(localStorage.getItem('ae_token')).toBe('xyz789');
    });

    it('register surfaces a failure without setting user', async () => {
        global.fetch.mockResolvedValueOnce(jsonResponse(409, { error: 'That username is already taken.' }));
        const user = userEvent.setup();
        renderHarness();

        await user.click(screen.getByText('register'));

        await waitFor(() => {
            expect(screen.getByTestId('error').textContent).toBe('That username is already taken.');
        });
        expect(screen.getByTestId('user').textContent).toBe('null');
    });

    it('loginWithToken sets user/session directly without calling fetch', async () => {
        const user = userEvent.setup();
        renderHarness();

        await user.click(screen.getByText('loginWithToken'));

        expect(global.fetch).not.toHaveBeenCalled();
        expect(screen.getByTestId('user').textContent).toBe(JSON.stringify({ id: 9, username: 'sso' }));
        expect(localStorage.getItem('ae_token')).toBe('sso-token');
    });

    it('logout clears user, token and session', async () => {
        localStorage.setItem('ae_token', 'existing-token');
        localStorage.setItem('ae_session', JSON.stringify({ id: 1, username: 'a' }));
        const user = userEvent.setup();
        renderHarness();

        expect(screen.getByTestId('user').textContent).toBe(JSON.stringify({ id: 1, username: 'a' }));

        await user.click(screen.getByText('logout'));

        expect(screen.getByTestId('user').textContent).toBe('null');
        expect(localStorage.getItem('ae_token')).toBeNull();
        expect(localStorage.getItem('ae_session')).toBeNull();
    });

    it('initializes user from an existing session in localStorage', () => {
        localStorage.setItem('ae_session', JSON.stringify({ id: 5, username: 'persisted' }));
        renderHarness();
        expect(screen.getByTestId('user').textContent).toBe(JSON.stringify({ id: 5, username: 'persisted' }));
    });
});
