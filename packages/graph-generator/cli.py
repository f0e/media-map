import json
import argparse
import logging
from pathlib import Path

from core import GraphData, generate_layout

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(
        description="Generate graph layout from input JSON."
    )
    parser.add_argument(
        "-i", "--input", type=Path, help="Path to input JSON file", required=True
    )
    parser.add_argument("output", type=Path, help="Path to output JSON file")

    args = parser.parse_args()

    logger.info("loading input json")

    with args.input.open("r", encoding="utf-8") as f:
        data = json.load(f)

    logger.info("loaded input json")

    graph_data = GraphData(**data)

    logger.info("generating layout")

    layout_response = generate_layout(graph_data)

    logger.info("generated layout")

    with args.output.open("w", encoding="utf-8") as f:
        json.dump(layout_response.model_dump(), f, indent=4)

    logger.info(f"layout successfully written to {args.output}")


if __name__ == "__main__":
    main()
