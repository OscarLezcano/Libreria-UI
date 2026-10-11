import Card from "@/common/components/Card";

export default function Home() {
  const img = <img
    src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
    alt="Shoes" />;
  return <Card
    img={img}
    price={100000}
    title="title"
    subtitle="subtitle"
    metadata={<p>metadata</p>}
    description="description" />;
}