use tauri_plugin_fs::FsExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![seedream_generate, expand_scope])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[derive(serde::Deserialize)]
struct SeeDreamRequest {
  api_key: String,
  base_url: Option<String>,
  model: String,
  prompt: String,
  image_base64: String,
  size: Option<String>,
}

#[derive(serde::Serialize)]
struct SeeDreamImageResponseData {
  b64_json: String,
}

#[derive(serde::Serialize)]
struct SeeDreamResponseWrapper {
  data: Vec<SeeDreamImageResponseData>,
}

#[tauri::command]
async fn seedream_generate(payload: SeeDreamRequest) -> Result<SeeDreamResponseWrapper, String> {
  let base = payload
    .base_url
    .unwrap_or_else(|| "https://ark.cn-beijing.volces.com".to_string());
  let url = format!("{}/api/v3/images/generations", base.trim_end_matches('/'));

  let client = reqwest::Client::builder()
    .use_rustls_tls()
    .build()
    .map_err(|e| e.to_string())?;

  let body = serde_json::json!({
    "model": payload.model,
    "prompt": payload.prompt,
    "image": [format!("data:image/jpeg;base64,{}", payload.image_base64)],
    "response_format": "b64_json",
    "size": payload.size.unwrap_or_else(|| "2K".into()),
    "watermark": false,
  });

  let res = client
    .post(&url)
    .bearer_auth(payload.api_key)
    .json(&body)
    .send()
    .await
    .map_err(|e| e.to_string())?;

  let status = res.status();
  let text = res.text().await.map_err(|e| e.to_string())?;
  if !status.is_success() {
    return Err(format!("SeeDream HTTP {}: {}", status, text));
  }

  let v: serde_json::Value = serde_json::from_str(&text).map_err(|e| e.to_string())?;
  // 直接透传 data 数组中的 b64_json
  let data = v
    .get("data")
    .and_then(|d| d.as_array())
    .ok_or_else(|| "Invalid response: missing data array".to_string())?
    .iter()
    .filter_map(|item| item.get("b64_json").and_then(|x| x.as_str()))
    .map(|s| SeeDreamImageResponseData { b64_json: s.to_string() })
    .collect::<Vec<_>>();

  Ok(SeeDreamResponseWrapper { data })
}

#[tauri::command]
fn expand_scope(app_handle: tauri::AppHandle, folder_path: std::path::PathBuf) -> Result<(), String> {
  // true means that we want inner directories allowed too
  app_handle
    .fs_scope()
    .allow_directory(&folder_path, true)
    .map_err(|err| err.to_string())
}
