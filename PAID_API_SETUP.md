# Gemini API 有料プラン（Pay-as-you-go）設定ガイド

無料枠（Free Tier）の制限（1分間に数回のみ、など）を解除するには、API Keyを発行しているGoogle Cloudプロジェクトに「請求先アカウント（クレジットカード）」を紐付ける必要があります。

## 手順

### 1. Google AI Studioでプランを確認
1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセスします。
2. 画面左側のメニューから **"Settings" (設定)** ⚙️ アイコンをクリックします。
3. **"Plan"** タブを確認します。
   - ここが "Free of Charge" になっている場合は、まだ無料枠です。

### 2. 請求先を設定する
1. 同じく [Google AI StudioのAPI Key一覧](https://aistudio.google.com/app/apikey) を開きます。
2. 使用しているAPI Keyの行にあるプロジェクト名（例: `Generative AI on January 12...`）をクリックすると、**Google Cloud Console** が開きます。
3. Google Cloud Consoleのメニュー（左上の三本線）から **「お支払い（Billing）」** を選択します。
4. **「請求先アカウントをリンク（Link a billing account）」** をクリックします。
5. クレジットカード情報を登録し、請求先アカウントを作成・紐付けます。

### 3. Pay-as-you-go (従量課金) の確認
1. 請求設定が完了すると、自動的に「Pay-as-you-go（従量課金）」プランに切り替わります。
2. これにより、レート制限（RPM/RPD）が大幅に緩和され、実質無制限に近い状態で使えるようになります。

## 注意点
- **料金**: Gemini 1.5 Flashなどは非常に安価ですが、大量に使うと料金が発生します。（個人利用の範囲なら月額数百円〜千円程度に収まることが多いです）
- **反映時間**: 設定してからAPIに反映されるまで、数分〜数十分かかる場合があります。
- **API Key**: 紐付け完了後も、同じAPI Keyをそのまま使えます。再発行の必要はありません。
