import {
  Form,
  message,
  Space,
  Spin,
  Typography,
  Upload,
  UploadProps,
} from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { useState } from "react";
const ProductImage = ({ initialImage }: { initialImage: string }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [imageUrl, setImageUrl] = useState<string>(initialImage);
  const [loading, setLoading] = useState(false);
  const uploaderConfig: UploadProps = {
    name: "file",
    multiple: false,
    showUploadList: false,
    beforeUpload: (file) => {
      const isJpnOrPng =
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/jpg" ||
        file.type === "image/webp";
      if (!isJpnOrPng) {
        messageApi.error("You can only upload JPG/PNG file!");
        return false;
      }
      const isLt500KB = file.size < 500 * 1024; // 500KB in bytes
      if (!isLt500KB) {
        messageApi.error("Image must be smaller than 500KB!");
        return false;
      }
      setLoading(true);

      setImageUrl(URL.createObjectURL(file));
      setLoading(false);
      return false;
    },
  };
  return (
    <Form.Item
      label="Product Image"
      name="image"
      rules={[
        {
          required: true,
          message: "Please upload your product image!",
        },
      ]}
    >
      <Upload listType="picture-card" accept="image/*" {...uploaderConfig}>
        {contextHolder}
        {loading ? (
          <div>
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            />
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="product image"
            style={{ width: "100%", padding: "10px" }}
          />
        ) : (
          <Space direction="vertical">
            <PlusOutlined />
            <Typography.Text>Upload</Typography.Text>
          </Space>
        )}
      </Upload>
    </Form.Item>
  );
};

export default ProductImage;
