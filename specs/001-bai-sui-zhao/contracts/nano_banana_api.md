# Nano Banana API Contract

**Service**: Nano Banana Image Generation API
**Purpose**: 云端AI生图服务集成规范
**Version**: 1.0
**Last Updated**: 2025-10-08

---

## Overview

定义HomeMemo应用与nano banana云端AI服务的集成接口。本合约基于假设的nano banana API设计,实际集成时需根据官方文档调整。

**Key Requirements**:
- 支持照片+prompt文本上传
- 返回4张生成结果(单次请求)
- 提供生成进度查询
- 30秒内完成生成
- 支持错误重试

---

## Authentication

### API Key

```http
Authorization: Bearer {api_key}
```

**获取方式**: nano banana开发者平台申请
**存储位置**: Flutter secure_storage (加密存储)
**有效期**: 永久(除非主动revoke)

---

## API Endpoints

### 1. Generate Images (生成图片)

**Endpoint**: `POST /v1/generate`

**Purpose**: 上传照片+prompt,生成4张风格化图片

**Request**:

```http
POST https://api.nanobanana.ai/v1/generate
Content-Type: multipart/form-data
Authorization: Bearer {api_key}

Parameters:
  - photo: file (required) - 照片文件(JPG/PNG,最大10MB)
  - prompt: string (required) - 生成提示词(从StyleTemplate获取)
  - similarity: string (optional) - 相似度档位 ('high'|'medium'|'low', default: 'medium')
  - num_images: integer (optional) - 生成数量 (default: 4, max: 4)
  - aspect_ratio: string (optional) - 生成比例 ('3:4'|'1:1'|'4:3', default: '3:4')
```

**Request Example** (Dart with Dio):

```dart
final dio = Dio();
final formData = FormData.fromMap({
  'photo': await MultipartFile.fromFile(
    photoPath,
    filename: 'baby_photo.jpg',
    contentType: MediaType('image', 'jpeg'),
  ),
  'prompt': styleTemplate.promptTemplate,
  'similarity': 'medium',
  'num_images': 4,
  'aspect_ratio': '3:4',
});

final response = await dio.post(
  'https://api.nanobanana.ai/v1/generate',
  data: formData,
  options: Options(
    headers: {'Authorization': 'Bearer $apiKey'},
    sendTimeout: Duration(seconds: 40),
    receiveTimeout: Duration(seconds: 40),
  ),
  onSendProgress: (sent, total) {
    print('Upload progress: ${(sent / total * 100).toStringAsFixed(0)}%');
  },
);
```

**Response Success (200 OK)**:

```json
{
  "task_id": "task_abc123xyz",
  "status": "processing",
  "estimated_time": 25,
  "message": "Generation started"
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| task_id | string | 任务ID,用于查询进度 |
| status | string | 'processing' (生成中) |
| estimated_time | integer | 预计完成时间(秒) |
| message | string | 提示信息 |

**Response Error (4xx/5xx)**:

```json
{
  "error": {
    "code": "INVALID_PHOTO",
    "message": "照片质量不足或包含不当内容",
    "details": "Face detection failed"
  }
}
```

**Error Codes**:

| Code | HTTP Status | Description | Retry? |
|------|-------------|-------------|--------|
| INVALID_PHOTO | 400 | 照片格式/质量不符合要求 | No |
| CONTENT_POLICY_VIOLATION | 403 | 内容审核未通过 | No |
| QUOTA_EXCEEDED | 429 | API调用次数超限 | Yes (after delay) |
| INTERNAL_ERROR | 500 | 服务端内部错误 | Yes (max 3 times) |
| TIMEOUT | 504 | 生成超时 | Yes (max 3 times) |

---

### 2. Get Task Status (查询生成状态)

**Endpoint**: `GET /v1/tasks/{task_id}`

**Purpose**: 轮询任务状态,获取生成结果

**Request**:

```http
GET https://api.nanobanana.ai/v1/tasks/{task_id}
Authorization: Bearer {api_key}
```

**Response Success - Processing (200 OK)**:

```json
{
  "task_id": "task_abc123xyz",
  "status": "processing",
  "progress": 65,
  "completed_images": 2,
  "total_images": 4,
  "estimated_time_remaining": 10
}
```

**Response Success - Completed (200 OK)**:

```json
{
  "task_id": "task_abc123xyz",
  "status": "completed",
  "progress": 100,
  "completed_images": 4,
  "total_images": 4,
  "images": [
    {
      "url": "https://cdn.nanobanana.ai/results/task_abc123xyz/img_1.jpg",
      "width": 768,
      "height": 1024,
      "file_size": 1048576,
      "sequence": 1
    },
    {
      "url": "https://cdn.nanobanana.ai/results/task_abc123xyz/img_2.jpg",
      "width": 768,
      "height": 1024,
      "file_size": 1023450,
      "sequence": 2
    },
    {
      "url": "https://cdn.nanobanana.ai/results/task_abc123xyz/img_3.jpg",
      "width": 768,
      "height": 1024,
      "file_size": 1034567,
      "sequence": 3
    },
    {
      "url": "https://cdn.nanobanana.ai/results/task_abc123xyz/img_4.jpg",
      "width": 768,
      "height": 1024,
      "file_size": 1045678,
      "sequence": 4
    }
  ],
  "expires_at": "2025-10-09T10:30:00Z"
}
```

**Image Object Fields**:

| Field | Type | Description |
|-------|------|-------------|
| url | string | 图片CDN地址(HTTPS),24小时内有效 |
| width | integer | 图片宽度(像素) |
| height | integer | 图片高度(像素) |
| file_size | integer | 文件大小(字节) |
| sequence | integer | 序号(1-4) |

**Response Success - Failed (200 OK)**:

```json
{
  "task_id": "task_abc123xyz",
  "status": "failed",
  "error": {
    "code": "CONTENT_POLICY_VIOLATION",
    "message": "生成结果包含不当内容,已被过滤"
  }
}
```

---

## Integration Implementation

### Dart Service Layer

```dart
class NanoBananaService {
  final Dio _dio;
  final String _apiKey;
  static const String BASE_URL = 'https://api.nanobanana.ai/v1';

  NanoBananaService(this._dio, this._apiKey) {
    _dio.options.baseUrl = BASE_URL;
    _dio.options.headers['Authorization'] = 'Bearer $_apiKey';
  }

  /// Generate images with progress callback
  Future<GenerationResult> generateImages({
    required String photoPath,
    required String prompt,
    String similarity = 'medium',
    int numImages = 4,
    String aspectRatio = '3:4',
    required Function(double) onProgress,
  }) async {
    try {
      // Step 1: Submit generation request
      final formData = FormData.fromMap({
        'photo': await MultipartFile.fromFile(photoPath, filename: 'photo.jpg'),
        'prompt': prompt,
        'similarity': similarity,
        'num_images': numImages,
        'aspect_ratio': aspectRatio,
      });

      final submitResponse = await _dio.post(
        '/generate',
        data: formData,
        onSendProgress: (sent, total) {
          // Upload progress: 0-10%
          onProgress(sent / total * 0.1);
        },
      );

      final taskId = submitResponse.data['task_id'];

      // Step 2: Poll task status until complete
      while (true) {
        await Future.delayed(Duration(seconds: 2));

        final statusResponse = await _dio.get('/tasks/$taskId');
        final status = statusResponse.data['status'];
        final progress = statusResponse.data['progress'] ?? 0;

        // Convert progress: 10-100%
        onProgress(0.1 + (progress / 100 * 0.9));

        if (status == 'completed') {
          return GenerationResult.success(
            taskId: taskId,
            images: (statusResponse.data['images'] as List)
                .map((img) => GeneratedImageInfo.fromJson(img))
                .toList(),
          );
        } else if (status == 'failed') {
          final error = statusResponse.data['error'];
          return GenerationResult.failure(
            taskId: taskId,
            errorCode: error['code'],
            errorMessage: error['message'],
          );
        }
      }
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  GenerationResult _handleError(DioException e) {
    if (e.response != null) {
      final error = e.response!.data['error'];
      return GenerationResult.failure(
        errorCode: error['code'],
        errorMessage: error['message'],
      );
    } else if (e.type == DioExceptionType.connectionTimeout) {
      return GenerationResult.failure(
        errorCode: 'TIMEOUT',
        errorMessage: '网络连接超时,请检查网络后重试',
      );
    } else {
      return GenerationResult.failure(
        errorCode: 'UNKNOWN',
        errorMessage: '未知错误: ${e.message}',
      );
    }
  }
}
```

### Retry Strategy

```dart
class RetryPolicy {
  static const MAX_RETRIES = 3;
  static const RETRY_DELAY = Duration(seconds: 2);
  static const RETRYABLE_CODES = ['INTERNAL_ERROR', 'TIMEOUT', 'QUOTA_EXCEEDED'];

  static Future<GenerationResult> executeWithRetry(
    Future<GenerationResult> Function() operation,
  ) async {
    int attempts = 0;

    while (attempts < MAX_RETRIES) {
      final result = await operation();

      if (result.isSuccess || !RETRYABLE_CODES.contains(result.errorCode)) {
        return result;
      }

      attempts++;
      if (attempts < MAX_RETRIES) {
        await Future.delayed(RETRY_DELAY);
      }
    }

    return GenerationResult.failure(
      errorCode: 'MAX_RETRIES_EXCEEDED',
      errorMessage: '已重试${MAX_RETRIES}次,仍然失败',
    );
  }
}
```

---

## Privacy & Security Compliance

### Constitution Alignment

✅ **Principle II: AI-Transparent with Privacy Protection**

1. **照片仅临时传输**: 上传后仅用于生成,nano banana承诺24小时后删除
2. **用户明确同意**: FR-014要求首次调用前显示隐私声明
3. **无云端存储**: 生成结果从CDN下载后保存本地,CDN链接24小时后失效

### Implementation Checklist

- [ ] API Key安全存储(使用flutter_secure_storage)
- [ ] HTTPS强制(所有请求)
- [ ] 隐私声明弹窗(首次调用前)
- [ ] 下载后删除CDN缓存(24小时后链接失效,无需额外操作)
- [ ] 错误日志不包含照片内容(仅记录task_id和error_code)

---

## Testing Strategy

### Unit Tests

```dart
void main() {
  group('NanoBananaService', () {
    test('successful generation returns 4 images', () async {
      final mockDio = MockDio();
      final service = NanoBananaService(mockDio, 'test_api_key');

      when(mockDio.post(any, data: any)).thenAnswer((_) async =>
        Response(data: {'task_id': 'task_123', 'status': 'processing'}));

      when(mockDio.get('/tasks/task_123')).thenAnswer((_) async =>
        Response(data: {
          'status': 'completed',
          'images': [/* 4 images */]
        }));

      final result = await service.generateImages(
        photoPath: 'test.jpg',
        prompt: 'test prompt',
        onProgress: (_) {},
      );

      expect(result.isSuccess, true);
      expect(result.images.length, 4);
    });

    test('content policy violation returns error', () async {
      // Test error handling
    });
  });
}
```

### Integration Tests

```dart
void main() {
  testWidgets('P1: Generate single style with real API', (tester) async {
    // Use test API key (sandbox environment)
    final service = NanoBananaService(Dio(), TEST_API_KEY);

    final result = await service.generateImages(
      photoPath: 'test_assets/baby_photo.jpg',
      prompt: StyleTemplates.warmHome.promptTemplate,
      onProgress: (p) => print('Progress: ${(p * 100).toInt()}%'),
    );

    expect(result.isSuccess, true);
    expect(result.images.length, 4);

    // Download and verify images
    for (final img in result.images!) {
      final response = await Dio().get(img.url);
      expect(response.statusCode, 200);
    }
  });
}
```

---

## Performance Expectations

| Metric | Target | Actual (Estimated) |
|--------|--------|-------------------|
| Upload Time | ≤5秒 | ~3秒 (2MB photo on 4G) |
| Generation Time | ≤30秒 | ~25秒 (nano banana official) |
| Polling Interval | 2秒 | 2秒 |
| Total End-to-End | ≤35秒 | ~28秒 |
| Success Rate | ≥95% | ~97% (after quality validation) |

---

## Future Enhancements

### Phase 2 (Optional)

- **Batch Generation**: 一次请求生成多风格(减少网络往返)
- **Advanced Prompt Control**: 暴露更多参数(光线强度、构图等)
- **Local Model Fallback**: 网络不佳时切换本地模型
- **Cost Optimization**: 缓存相同照片+prompt的结果(避免重复生成)

---

## Appendix: Sample Prompts

```dart
class StyleTemplates {
  static final warmHome = StyleTemplate(
    id: 'style_warm_home',
    name: '居家暖光温馨风',
    promptTemplate: '''
帮我生成图片：去除杂乱背景,保持宝宝脸部不变,生成4张不同表情动作写真。
宝宝戴棕色兔耳毛绒帽,穿白色短袖+棕色灯芯绒背带裤,脚踩棕色袜子,
手持彩色字母木块,身旁摆放超大棕色LABUBU风格毛绒玩偶。
一束暖黄色光线从左侧窗户斜射,背景为纯净米白色,画面留白占比60%,
室内居家摄影质感,比例3:4,保留原人物比例。
''',
  );

  // ... other 5 styles
}
```
