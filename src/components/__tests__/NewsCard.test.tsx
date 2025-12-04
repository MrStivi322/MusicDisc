import { render, screen } from '@testing-library/react'
import { NewsCard } from '@/components/NewsCard'

jest.mock('@/hooks/useOnScreenCenter', () => ({
    useOnScreenCenter: () => [jest.fn(), false]
}))

describe('NewsCard', () => {
    const mockProps = {
        id: '1',
        title: 'Test News Article',
        excerpt: 'This is a test excerpt for the news article',
        image: 'https://example.com/news.jpg',
        date: '2024-01-15',
        category: ['Technology'],  // Changed to array
        author: 'John Doe',
        commentsCount: 5,
        viewsCount: 1000
    }

    it('renders news title correctly', () => {
        render(<NewsCard {...mockProps} />)
        expect(screen.getByText('Test News Article')).toBeInTheDocument()
    })

    it('renders excerpt text', () => {
        render(<NewsCard {...mockProps} />)
        expect(screen.getByText('This is a test excerpt for the news article')).toBeInTheDocument()
    })

    it('renders category badge', () => {
        render(<NewsCard {...mockProps} />)
        expect(screen.getByText('Technology')).toBeInTheDocument()
    })

    it('renders author name', () => {
        render(<NewsCard {...mockProps} />)
        expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('displays view count correctly', () => {
        render(<NewsCard {...mockProps} />)
        expect(screen.getByText('1,000')).toBeInTheDocument()
    })

    it('displays comments count', () => {
        render(<NewsCard {...mockProps} />)
        expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('renders image when provided', () => {
        render(<NewsCard {...mockProps} />)
        const image = screen.getByAltText('News image: Test News Article')
        expect(image).toBeInTheDocument()
    })

    it('renders placeholder when no image provided', () => {
        const propsWithoutImage = { ...mockProps, image: undefined }
        render(<NewsCard {...propsWithoutImage} />)
        expect(screen.getByText('News Image')).toBeInTheDocument()
    })

    it('links to correct news detail page', () => {
        render(<NewsCard {...mockProps} />)
        const link = screen.getByRole('link')
        expect(link).toHaveAttribute('href', '/news/1')
    })

    it('shows Anonymous when no author provided', () => {
        const propsWithoutAuthor = { ...mockProps, author: undefined }
        render(<NewsCard {...propsWithoutAuthor} />)
        expect(screen.getByText('Anonymous')).toBeInTheDocument()
    })
})
