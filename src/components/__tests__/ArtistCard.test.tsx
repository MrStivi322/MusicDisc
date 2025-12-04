import { render, screen } from '@testing-library/react'
import { ArtistCard } from '@/components/ArtistCard'

// Mock the custom hook
jest.mock('@/hooks/useOnScreenCenter', () => ({
    useOnScreenCenter: () => [jest.fn(), false]
}))

describe('ArtistCard', () => {
    const mockProps = {
        id: '1',
        name: 'Test Artist',
        genre: 'Rock',
        image: 'https://example.com/image.jpg',
        followers: '1000000'
    }

    it('renders artist name correctly', () => {
        render(<ArtistCard {...mockProps} />)
        expect(screen.getByText('Test Artist')).toBeInTheDocument()
    })

    it('renders genre tag', () => {
        render(<ArtistCard {...mockProps} />)
        expect(screen.getByText('Rock')).toBeInTheDocument()
    })

    it('renders artist image when provided', () => {
        render(<ArtistCard {...mockProps} />)
        const image = screen.getByAltText('Test Artist - Rock artist profile picture')
        expect(image).toBeInTheDocument()
    })

    it('renders placeholder when no image provided', () => {
        const propsWithoutImage = { ...mockProps, image: undefined }
        render(<ArtistCard {...propsWithoutImage} />)
        expect(screen.getByText('T')).toBeInTheDocument() // First letter
    })

    it('applies wide class when isWide is true', () => {
        const { container } = render(<ArtistCard {...mockProps} isWide />)
        expect(container.querySelector('.wide')).toBeInTheDocument()
    })

    it('shows group tag when isWide is true', () => {
        render(<ArtistCard {...mockProps} isWide />)
        expect(screen.getByText('Grupo')).toBeInTheDocument()
    })

    it('links to correct artist page', () => {
        render(<ArtistCard {...mockProps} />)
        const link = screen.getByRole('link')
        expect(link).toHaveAttribute('href', '/artist/1')
    })

    it('calls onClick handler when clicked', () => {
        const handleClick = jest.fn()
        render(<ArtistCard {...mockProps} onClick={handleClick} />)

        const link = screen.getByRole('link')
        link.click()

        expect(handleClick).toHaveBeenCalledTimes(1)
    })
})
