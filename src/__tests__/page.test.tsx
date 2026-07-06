import React from 'react'
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import Home from '../app/page'

test('renders landing page with operational pillars heading', () => {
  render(<Home />)
  
  // Verify main heading exists
  const heading = screen.getByRole('heading', { name: /Intelligent Operations/i })
  expect(heading).toBeInTheDocument()

  // Verify that the three pillars are mentioned
  const navigationPillar = screen.getByText(/Smart Navigation/i)
  expect(navigationPillar).toBeInTheDocument()

  const crowdPillar = screen.getByText(/Crowd Management/i)
  expect(crowdPillar).toBeInTheDocument()

  const multilingualPillar = screen.getByText(/Multilingual AI/i)
  expect(multilingualPillar).toBeInTheDocument()
})
