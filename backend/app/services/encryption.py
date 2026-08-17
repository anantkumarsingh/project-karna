"""Encrypt-at-rest for uploaded files. Single local key, stored in the OS
keychain via `keyring` — no per-launch passphrase prompt, since this app is
single-user/local-first for now (protects against laptop/disk theft, not a
hosted multi-user threat model — that's a separate future conversation).
"""
import keyring
from cryptography.fernet import Fernet

_SERVICE_NAME = "karna"
_KEY_NAME = "file_encryption_key"

_key: bytes | None = None


def get_or_create_key() -> bytes:
    global _key
    if _key is not None:
        return _key

    stored = keyring.get_password(_SERVICE_NAME, _KEY_NAME)
    if stored is None:
        generated = Fernet.generate_key()
        keyring.set_password(_SERVICE_NAME, _KEY_NAME, generated.decode())
        _key = generated
    else:
        _key = stored.encode()
    return _key


def encrypt_bytes(data: bytes) -> bytes:
    return Fernet(get_or_create_key()).encrypt(data)


def decrypt_bytes(token: bytes) -> bytes:
    return Fernet(get_or_create_key()).decrypt(token)
