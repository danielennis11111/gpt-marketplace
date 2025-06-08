#!/usr/bin/env python3
"""
Split a large PDF into individual pages
Useful for testing context optimization with multiple document chunks
"""

import os
from PyPDF2 import PdfReader, PdfWriter

def install_pypdf2():
    """Install PyPDF2 if not present"""
    try:
        import PyPDF2
    except ImportError:
        print("Installing PyPDF2...")
        os.system("pip install PyPDF2")
        import PyPDF2

def split_pdf(input_path, output_dir="pdf_pages"):
    """Split PDF into individual pages"""
    
    # Create output directory
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Read the PDF
    with open(input_path, 'rb') as file:
        pdf_reader = PdfReader(file)
        total_pages = len(pdf_reader.pages)
        
        print(f"Splitting {input_path} into {total_pages} pages...")
        
        # Extract each page
        for page_num in range(total_pages):
            pdf_writer = PdfWriter()
            pdf_writer.add_page(pdf_reader.pages[page_num])
            
            # Create output filename
            output_filename = f"page_{page_num + 1:03d}.pdf"
            output_path = os.path.join(output_dir, output_filename)
            
            # Write individual page
            with open(output_path, 'wb') as output_file:
                pdf_writer.write(output_file)
            
            # Check file size
            page_size = os.path.getsize(output_path)
            print(f"  Created {output_filename} ({page_size / 1024:.1f} KB)")
        
        print(f"\nSplit complete! {total_pages} pages saved to {output_dir}/")
        
        # Show directory contents
        print(f"\nDirectory contents:")
        for file in sorted(os.listdir(output_dir)):
            if file.endswith('.pdf'):
                file_path = os.path.join(output_dir, file)
                size_kb = os.path.getsize(file_path) / 1024
                print(f"  {file} ({size_kb:.1f} KB)")

def extract_text_from_pages(output_dir="pdf_pages", text_dir="pdf_text"):
    """Extract text content from each page for context testing"""
    
    if not os.path.exists(text_dir):
        os.makedirs(text_dir)
    
    pdf_files = [f for f in os.listdir(output_dir) if f.endswith('.pdf')]
    pdf_files.sort()
    
    print(f"\nExtracting text from {len(pdf_files)} pages...")
    
    total_chars = 0
    total_tokens = 0
    
    for pdf_file in pdf_files:
        pdf_path = os.path.join(output_dir, pdf_file)
        
        # Extract text
        with open(pdf_path, 'rb') as file:
            pdf_reader = PdfReader(file)
            page = pdf_reader.pages[0]  # Each file has one page
            text = page.extract_text()
        
        # Save text file
        text_filename = pdf_file.replace('.pdf', '.txt')
        text_path = os.path.join(text_dir, text_filename)
        
        with open(text_path, 'w', encoding='utf-8') as text_file:
            text_file.write(text)
        
        # Estimate tokens (using the same formula as our app)
        char_count = len(text)
        token_estimate = max(1, int(char_count / 3.8))  # Gemini tokenizer ratio
        
        total_chars += char_count
        total_tokens += token_estimate
        
        print(f"  {text_filename}: {char_count:,} chars, ~{token_estimate:,} tokens")
    
    print(f"\nText extraction complete!")
    print(f"Total characters: {total_chars:,}")
    print(f"Total estimated tokens: {total_tokens:,}")
    print(f"Average tokens per page: {total_tokens // len(pdf_files):,}")

if __name__ == "__main__":
    install_pypdf2()
    
    # Default input file (created by generate_large_pdf.py)
    input_pdf = "large_ai_research_document.pdf"
    
    if os.path.exists(input_pdf):
        print(f"Found {input_pdf}")
        file_size = os.path.getsize(input_pdf) / (1024 * 1024)
        print(f"File size: {file_size:.2f} MB")
        
        # Split the PDF
        split_pdf(input_pdf)
        
        # Extract text for token analysis
        extract_text_from_pages()
        
    else:
        print(f"PDF file not found: {input_pdf}")
        print("Run generate_large_pdf.py first to create the PDF")
        print("Or specify a different PDF file path") 