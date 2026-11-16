import type { Content } from '../../services/api'
import ContentCard from './ContentCard'

function TitleGrid({ items }: { items: Content[] }) {
    return (
        <div className="flex flex-wrap gap-x-4 gap-y-6">
            {items.map((item) => (
                <ContentCard key={item._id} item={item} />
            ))}
        </div>
    )
}

export default TitleGrid
