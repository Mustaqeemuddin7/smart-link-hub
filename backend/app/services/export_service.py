"""
Smart Link Hub - Export Service
Generates CSV and PDF reports for analytics data
"""
import io
import csv
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from uuid import UUID


def generate_csv_report(
    hub_title: str,
    hub_slug: str,
    analytics_data: Dict[str, Any],
    link_performance: List[Dict[str, Any]],
    daily_stats: List[Dict[str, Any]],
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
) -> bytes:
    """
    Generate a CSV report for hub analytics.
    
    Returns CSV bytes.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header section
    writer.writerow(["Smart Link Hub - Analytics Report"])
    writer.writerow([])
    writer.writerow(["Hub Title", hub_title])
    writer.writerow(["Hub Slug", hub_slug])
    writer.writerow(["Generated At", datetime.utcnow().isoformat()])
    if start_date and end_date:
        writer.writerow(["Date Range", f"{start_date.date()} to {end_date.date()}"])
    writer.writerow([])
    
    # Summary section
    writer.writerow(["=== SUMMARY ==="])
    writer.writerow(["Metric", "Value"])
    writer.writerow(["Total Visits", analytics_data.get("total_visits", 0)])
    writer.writerow(["Total Clicks", analytics_data.get("total_clicks", 0)])
    writer.writerow(["CTR (%)", f"{analytics_data.get('ctr', 0):.2f}"])
    writer.writerow(["Unique Visitors", analytics_data.get("unique_visitors", 0)])
    writer.writerow([])
    
    # Device breakdown
    device_breakdown = analytics_data.get("device_breakdown", {})
    writer.writerow(["=== DEVICE BREAKDOWN ==="])
    writer.writerow(["Device", "Count", "Percentage"])
    total_devices = sum(device_breakdown.values()) or 1
    for device, count in device_breakdown.items():
        percentage = (count / total_devices) * 100
        writer.writerow([device.capitalize(), count, f"{percentage:.1f}%"])
    writer.writerow([])
    
    # Country breakdown
    country_breakdown = analytics_data.get("country_breakdown", {})
    if country_breakdown:
        writer.writerow(["=== TOP COUNTRIES ==="])
        writer.writerow(["Country", "Visits"])
        for country, visits in sorted(country_breakdown.items(), key=lambda x: x[1], reverse=True)[:10]:
            writer.writerow([country, visits])
        writer.writerow([])
    
    # Link performance
    if link_performance:
        writer.writerow(["=== LINK PERFORMANCE ==="])
        writer.writerow(["Link Title", "URL", "Clicks", "CTR (%)"])
        for link in link_performance:
            writer.writerow([
                link.get("title", ""),
                link.get("url", ""),
                link.get("clicks", 0),
                f"{link.get('ctr', 0):.2f}"
            ])
        writer.writerow([])
    
    # Daily stats
    if daily_stats:
        writer.writerow(["=== DAILY STATISTICS ==="])
        writer.writerow(["Date", "Visits", "Clicks", "CTR (%)"])
        for day in daily_stats:
            writer.writerow([
                day.get("date", ""),
                day.get("visits", 0),
                day.get("clicks", 0),
                f"{day.get('ctr', 0):.2f}"
            ])
    
    output.seek(0)
    return output.getvalue().encode('utf-8')


def generate_pdf_report(
    hub_title: str,
    hub_slug: str,
    analytics_data: Dict[str, Any],
    link_performance: List[Dict[str, Any]],
    daily_stats: List[Dict[str, Any]],
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
) -> bytes:
    """
    Generate a PDF report for hub analytics.
    
    Returns PDF bytes.
    """
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#22C55E'),
        spaceAfter=20
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#22C55E'),
        spaceBefore=15,
        spaceAfter=10
    )
    
    elements = []
    
    # Title
    elements.append(Paragraph("Smart Link Hub Analytics Report", title_style))
    elements.append(Spacer(1, 10))
    
    # Hub info
    elements.append(Paragraph(f"<b>Hub:</b> {hub_title}", styles['Normal']))
    elements.append(Paragraph(f"<b>Slug:</b> {hub_slug}", styles['Normal']))
    elements.append(Paragraph(f"<b>Generated:</b> {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", styles['Normal']))
    if start_date and end_date:
        elements.append(Paragraph(f"<b>Date Range:</b> {start_date.date()} to {end_date.date()}", styles['Normal']))
    elements.append(Spacer(1, 20))
    
    # Summary table
    elements.append(Paragraph("Summary", heading_style))
    summary_data = [
        ["Metric", "Value"],
        ["Total Visits", str(analytics_data.get("total_visits", 0))],
        ["Total Clicks", str(analytics_data.get("total_clicks", 0))],
        ["CTR", f"{analytics_data.get('ctr', 0):.2f}%"],
        ["Unique Visitors", str(analytics_data.get("unique_visitors", 0))],
    ]
    summary_table = Table(summary_data, colWidths=[2*inch, 2*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#22C55E')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F0FDF4')),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#22C55E')),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 20))
    
    # Device breakdown
    device_breakdown = analytics_data.get("device_breakdown", {})
    if device_breakdown:
        elements.append(Paragraph("Device Breakdown", heading_style))
        device_data = [["Device", "Count"]]
        for device, count in device_breakdown.items():
            device_data.append([device.capitalize(), str(count)])
        device_table = Table(device_data, colWidths=[2*inch, 2*inch])
        device_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#22C55E')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#CCCCCC')),
        ]))
        elements.append(device_table)
        elements.append(Spacer(1, 20))
    
    # Link performance
    if link_performance:
        elements.append(Paragraph("Link Performance", heading_style))
        link_data = [["Title", "Clicks", "CTR"]]
        for link in link_performance[:10]:  # Top 10
            link_data.append([
                link.get("title", "")[:30],  # Truncate
                str(link.get("clicks", 0)),
                f"{link.get('ctr', 0):.2f}%"
            ])
        link_table = Table(link_data, colWidths=[3*inch, 1*inch, 1*inch])
        link_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#22C55E')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#CCCCCC')),
        ]))
        elements.append(link_table)
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
