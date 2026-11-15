import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ.setdefault('DATA_DIR', '/tmp/creavixworld')
os.environ.setdefault('NO_SHOTS', '1')

from app import app
