import OpenAI from "openai";

const openai = new OpenAI({
  // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx"
 // 新加坡和北京地域的API Key不同。获取API Key：https://help.aliyun.com/zh/model-studio/get-api-key
  apiKey: process.env.DASHSCOPE_API_KEY,
  // 以下是北京地域base_url，如果使用新加坡地域的模型，需要将base_url替换为：https://dashscope-intl.aliyuncs.com/compatible-mode/v1
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

async function main() {
  const response = await openai.chat.completions.create({
    model: "qwen3-vl-plus",  // 此处以qwen3-vl-plus为例，可按需更换模型名称。模型列表：https://help.aliyun.com/zh/model-studio/models
    messages: [
      {
        role: "user",
        content: [{
            type: "image_url",
            image_url: {
              "url": "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20241022/emyrja/dog_and_girl.jpeg"
            }
          },
          {
            type: "text",
            text: "图中描绘的是什么景象?"
          }
        ]
      }
    ]
  });
  console.log(response.choices[0].message.content);
}
main()