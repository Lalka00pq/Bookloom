# python
import logging
import logging.handlers
from pathlib import Path

# 3rd party
import structlog
from structlog.stdlib import ProcessorFormatter
from structlog.types import EventDict, Processor


def add_app_name(
    logger: logging.Logger, method_name: str, event_dict: EventDict
) -> EventDict:
    """Add application name to log events."""
    event_dict["application"] = "Bookloom"
    return event_dict


def setup_logging(log_dir: str = "logs") -> None:
    """Configure structlog with JSON formatting and file rotation.

    Args:
        log_dir: Directory to store log files
    """
    # Create logs directory if it doesn't exist
    log_path = Path(log_dir)
    log_path.mkdir(exist_ok=True)

    # Configure processors for structlog that will be used by stdlib
    shared_processors: list[Processor] = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        add_app_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
    ]

    # Configure structlog to work with standard library logging
    structlog.configure(
        processors=shared_processors +
        [structlog.stdlib.ProcessorFormatter.wrap_for_formatter],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # Set up timed rotating file handler (rotates daily)
    file_handler = logging.handlers.TimedRotatingFileHandler(
        filename=log_path / "bookloom.log",
        when="midnight",
        interval=1,
        backupCount=30,  # Keep 30 days of logs
        encoding="utf-8",
    )

    # Use ProcessorFormatter to format logs as JSON
    file_formatter = ProcessorFormatter(
        processor=structlog.processors.JSONRenderer(),
        foreign_pre_chain=shared_processors,
    )
    file_handler.setFormatter(file_formatter)

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.handlers = []  # Clear existing handlers
    root_logger.addHandler(file_handler)
    root_logger.setLevel(logging.INFO)


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    """Get a structlog logger instance.

    Args:
        name: Logger name (typically __name__)

    Returns:
        Configured structlog logger
    """
    return structlog.get_logger(name)
