#!/usr/bin/env python3
"""
HuggingFace Avatar System Test Script
Tests API connectivity and avatar model endpoints for danielennis11111
"""

import os
import sys
import requests
import json
from typing import Dict, Any
import time

class HuggingFaceAvatarTester:
    def __init__(self):
        self.hf_token = os.getenv('HF_TOKEN') or os.getenv('NEXT_PUBLIC_HF_TOKEN')
        self.headers = {
            'Authorization': f'Bearer {self.hf_token}' if self.hf_token else None,
            'Content-Type': 'application/json'
        }
        
        # Avatar model endpoints
        self.avatar_endpoints = {
            'hallo': 'https://fffiloni-hallo-api.hf.space',
            'sadtalker': 'https://sadtalker.hf.space',
            'talking_face_tts': 'https://cvpr-ml-talking-face.hf.space',
            'tts_hallo': 'https://fffiloni-tts-hallo-talking-portrait.hf.space'
        }
        
        # HuggingFace API endpoints
        self.hf_api_base = 'https://api-inference.huggingface.co/models'
        self.tts_models = [
            'microsoft/speecht5_tts',
            'facebook/mms-tts-eng',
            'espnet/kan-bayashi_ljspeech_vits'
        ]

    def print_header(self, title: str):
        """Print a formatted header"""
        print(f"\n{'='*60}")
        print(f"🎭 {title}")
        print(f"{'='*60}")

    def test_hf_api_connection(self) -> bool:
        """Test basic HuggingFace API connectivity"""
        self.print_header("Testing HuggingFace API Connection")
        
        if not self.hf_token:
            print("❌ No HuggingFace token found!")
            print("💡 Please run the setup script first: ./scripts/setup-huggingface.sh")
            return False
        
        print(f"🔑 Token found: {self.hf_token[:10]}...{self.hf_token[-5:]}")
        
        # Test whoami endpoint
        try:
            response = requests.get(
                'https://huggingface.co/api/whoami-v2',
                headers={'Authorization': f'Bearer {self.hf_token}'},
                timeout=10
            )
            
            if response.status_code == 200:
                user_info = response.json()
                print(f"✅ Authenticated as: {user_info.get('name', 'Unknown')}")
                print(f"📧 Email: {user_info.get('email', 'Not provided')}")
                return True
            else:
                print(f"❌ Authentication failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Connection error: {e}")
            return False

    def test_avatar_endpoints(self) -> Dict[str, bool]:
        """Test avatar model endpoints availability"""
        self.print_header("Testing Avatar Model Endpoints")
        
        results = {}
        
        for name, url in self.avatar_endpoints.items():
            print(f"\n🧪 Testing {name}...")
            print(f"   URL: {url}")
            
            try:
                # Test basic connectivity
                response = requests.get(url, timeout=15)
                
                if response.status_code == 200:
                    print(f"   ✅ {name}: Available (Status: {response.status_code})")
                    results[name] = True
                else:
                    print(f"   ⚠️  {name}: Responding but status {response.status_code}")
                    results[name] = False
                    
            except requests.exceptions.Timeout:
                print(f"   ⏰ {name}: Timeout (may be sleeping)")
                results[name] = False
            except Exception as e:
                print(f"   ❌ {name}: Error - {e}")
                results[name] = False
        
        return results

    def test_tts_models(self) -> Dict[str, bool]:
        """Test TTS model endpoints"""
        self.print_header("Testing TTS Models")
        
        results = {}
        test_text = "Hello, this is a test of the text to speech system."
        
        for model in self.tts_models:
            print(f"\n🗣️  Testing {model}...")
            
            try:
                url = f"{self.hf_api_base}/{model}"
                payload = {"inputs": test_text}
                
                response = requests.post(
                    url,
                    headers=self.headers,
                    json=payload,
                    timeout=30
                )
                
                if response.status_code == 200:
                    print(f"   ✅ {model}: Available")
                    results[model] = True
                elif response.status_code == 503:
                    print(f"   🔄 {model}: Loading (try again in a moment)")
                    results[model] = False
                else:
                    print(f"   ❌ {model}: Status {response.status_code}")
                    results[model] = False
                    
            except Exception as e:
                print(f"   ❌ {model}: Error - {e}")
                results[model] = False
        
        return results

    def test_avatar_generation_flow(self) -> bool:
        """Test a complete avatar generation flow"""
        self.print_header("Testing Avatar Generation Flow")
        
        print("🎭 Simulating avatar generation process...")
        
        # Step 1: Text to Speech
        print("\n1️⃣ Text to Speech Generation:")
        test_text = "Hello! I'm your AI avatar assistant."
        print(f"   Input text: '{test_text}'")
        
        # Test TTS
        try:
            tts_url = f"{self.hf_api_base}/microsoft/speecht5_tts"
            tts_payload = {"inputs": test_text}
            
            print("   🗣️  Generating speech...")
            tts_response = requests.post(
                tts_url,
                headers=self.headers,
                json=tts_payload,
                timeout=30
            )
            
            if tts_response.status_code == 200:
                print("   ✅ TTS generation successful")
                audio_size = len(tts_response.content)
                print(f"   📊 Audio data size: {audio_size} bytes")
            else:
                print(f"   ⚠️  TTS status: {tts_response.status_code}")
                
        except Exception as e:
            print(f"   ❌ TTS error: {e}")
        
        # Step 2: Avatar Generation (simulated)
        print("\n2️⃣ Avatar Generation:")
        print("   🎭 Would generate talking head video...")
        print("   📷 Input: User uploaded image")
        print("   🔊 Audio: Generated TTS")
        print("   🎬 Output: Talking head video")
        
        return True

    def generate_report(self, api_ok: bool, avatar_results: Dict, tts_results: Dict):
        """Generate a summary report"""
        self.print_header("Summary Report")
        
        print("📊 Test Results:")
        print(f"   🔑 HuggingFace API: {'✅ Connected' if api_ok else '❌ Failed'}")
        
        print(f"\n🎭 Avatar Endpoints ({sum(avatar_results.values())}/{len(avatar_results)} available):")
        for name, status in avatar_results.items():
            icon = "✅" if status else "❌"
            print(f"   {icon} {name}: {'Available' if status else 'Unavailable'}")
        
        print(f"\n🗣️  TTS Models ({sum(tts_results.values())}/{len(tts_results)} available):")
        for model, status in tts_results.items():
            icon = "✅" if status else "❌"
            model_short = model.split('/')[-1]
            print(f"   {icon} {model_short}: {'Available' if status else 'Unavailable'}")
        
        print(f"\n🎯 Ready for Avatar Generation:")
        ready = api_ok and any(avatar_results.values()) and any(tts_results.values())
        
        if ready:
            print("   ✅ System ready! You can start generating avatars.")
            print("\n🚀 Next steps:")
            print("   1. npm run dev")
            print("   2. Navigate to avatar interface")
            print("   3. Upload a photo and test!")
        else:
            print("   ⚠️  System not fully ready. Check the issues above.")
            print("\n🔧 Troubleshooting:")
            if not api_ok:
                print("   - Get HuggingFace API token from https://huggingface.co/settings/tokens")
            if not any(avatar_results.values()):
                print("   - Avatar endpoints may be temporarily down")
            if not any(tts_results.values()):
                print("   - TTS models may be loading (wait a few minutes)")

def main():
    """Main test function"""
    print("🎭 HuggingFace Avatar System Test")
    print("🔧 Testing integration for danielennis11111")
    
    tester = HuggingFaceAvatarTester()
    
    # Run tests
    api_ok = tester.test_hf_api_connection()
    avatar_results = tester.test_avatar_endpoints()
    tts_results = tester.test_tts_models()
    
    if api_ok:
        tester.test_avatar_generation_flow()
    
    # Generate report
    tester.generate_report(api_ok, avatar_results, tts_results)
    
    print(f"\n🎪 Profile: https://huggingface.co/danielennis11111")
    print("🎉 Test complete!")

if __name__ == "__main__":
    main() 