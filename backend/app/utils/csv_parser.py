"""CSV parsing utilities."""
import csv
from typing import List, Dict, Any
from pathlib import Path
from app.core.exceptions import BadRequestError


def parse_csv_file(file_path: Path, max_rows: int = 100) -> Dict[str, Any]:
    """
    Parse a CSV file and return headers and rows.
    
    Args:
        file_path: Path to the CSV file
        max_rows: Maximum number of rows to return (for performance)
    
    Returns:
        Dictionary with filename, headers, rows, and total_rows
    """
    if not file_path.exists():
        raise BadRequestError("CSV file not found on disk")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            # Try to detect delimiter
            sample = f.read(1024)
            f.seek(0)
            sniffer = csv.Sniffer()
            delimiter = sniffer.sniff(sample).delimiter
            
            reader = csv.DictReader(f, delimiter=delimiter)
            rows = list(reader)
            
            if not rows:
                return {
                    "filename": file_path.name,
                    "headers": [],
                    "rows": [],
                    "total_rows": 0
                }
            
            headers = list(rows[0].keys())
            total_rows = len(rows)
            
            # Limit rows for performance
            limited_rows = rows[:max_rows]
            
            return {
                "filename": file_path.name,
                "headers": headers,
                "rows": limited_rows,
                "total_rows": total_rows
            }
    except csv.Error as e:
        raise BadRequestError(f"Error parsing CSV file: {str(e)}")
    except Exception as e:
        raise BadRequestError(f"Error reading CSV file: {str(e)}")

