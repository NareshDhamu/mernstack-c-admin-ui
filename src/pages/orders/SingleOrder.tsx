import {
  Avatar,
  Breadcrumb,
  Card,
  Col,
  Flex,
  List,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import { Link, useParams } from "react-router-dom";
import { RightOutlined } from "@ant-design/icons";
import { colorMapping } from "../../constants";
import { capitalizeFirst } from "../../utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { changeStatus, getSingle } from "../../http/api";
import { Order, OrderStatus } from "../../types";
import { format } from "date-fns";

const orderStatusOptions = [
  {
    value: "received",
    label: "Received",
  },
  {
    value: "confirmed",
    label: "Confirmed",
  },
  {
    value: "prepared",
    label: "Prepared",
  },
  {
    value: "out_for_delivery",
    label: "Out For Delivery",
  },
  {
    value: "delivered",
    label: "Delivered",
  },
];
const SingleOrder = () => {
  const params = useParams();
  const orderId = params.orderId;
  const { data: order } = useQuery<Order>({
    queryKey: ["order", orderId],
    queryFn: () => {
      const queryString = new URLSearchParams({
        fields:
          "cart,address,paymentMode,total,tenantId,paymentStatus,comment,orderStatus,createdAt",
      }).toString();
      return getSingle(orderId as string, queryString).then((res) => res.data);
    },
  });
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationKey: ["order", orderId],
    mutationFn: async (status: OrderStatus) => {
      return await changeStatus(orderId as string, { status: status }).then(
        (res) => res.data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    },
  });
  if (!order) return null;

  const handleStatusChange = (status: OrderStatus) => {
    mutate(status);
  };
  return (
    <Space style={{ width: "100%" }} direction="vertical">
      <Flex justify="space-between" align="center">
        <Breadcrumb
          separator={<RightOutlined />}
          items={[
            { title: <Link to="/">Dashboard</Link> },
            { title: <Link to="/orders">Orders</Link> },
            { title: `Order #${order?._id}` },
          ]}
        />
        <Space>
          <Typography.Text>Change Order Status</Typography.Text>
          <Select
            defaultValue={order.orderStatus}
            style={{
              width: 150,
            }}
            options={orderStatusOptions}
            onChange={handleStatusChange}
          />
        </Space>
      </Flex>
      <Row gutter={24}>
        <Col span={14}>
          <Card
            title="Order Details"
            extra={
              <Tag
                bordered={false}
                color={colorMapping[order.orderStatus] ?? "processing"}
              >
                {capitalizeFirst(order.orderStatus)}
              </Tag>
            }
          >
            <List
              itemLayout="horizontal"
              dataSource={order?.cart}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={item.image} shape="circle" />}
                    title={item.name}
                    description={item.chosenConfiguration.selectedToppings.map(
                      (topping) => capitalizeFirst(topping.name)
                    )}
                  />
                  <Space size={"large"}>
                    <Typography.Text>
                      {Object.values(
                        item.chosenConfiguration.priceConfiguration
                      ).join(", ")}
                    </Typography.Text>
                    <Typography.Text>
                      {item.qty} Item{item.qty > 1 && "s"}
                    </Typography.Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={10}>
          <Card title="Customer Details">
            <Space direction="vertical">
              <Flex style={{ flexDirection: "column" }}>
                <Typography.Text type="secondary">Name</Typography.Text>
                <Typography.Text>
                  {order.customerId.firstName + " " + order.customerId.lastName}
                </Typography.Text>
              </Flex>
              <Flex style={{ flexDirection: "column" }}>
                <Typography.Text type="secondary">Address</Typography.Text>
                <Typography.Text>{order.address}</Typography.Text>
              </Flex>
              <Flex style={{ flexDirection: "column" }}>
                <Typography.Text type="secondary">
                  Payment Method
                </Typography.Text>
                <Typography.Text>
                  {order.paymentMode.toUpperCase()}
                </Typography.Text>
              </Flex>
              <Flex style={{ flexDirection: "column" }}>
                <Typography.Text type="secondary">
                  Payment Status
                </Typography.Text>
                <Typography.Text>
                  {capitalizeFirst(order.paymentStatus)}
                </Typography.Text>
              </Flex>
              <Flex style={{ flexDirection: "column" }}>
                <Typography.Text type="secondary">Order Amount</Typography.Text>
                <Typography.Text>₹{order.total}</Typography.Text>
              </Flex>
              <Flex style={{ flexDirection: "column" }}>
                <Typography.Text type="secondary">Order Time</Typography.Text>
                <Typography.Text>
                  {format(new Date(order.createdAt), "dd MMMM yyyy hh:mm a")}
                </Typography.Text>
              </Flex>
              {order.comment && (
                <Flex style={{ flexDirection: "column" }}>
                  <Typography.Text type="secondary">Comment</Typography.Text>
                  <Typography.Text>{order.comment}</Typography.Text>
                </Flex>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default SingleOrder;
