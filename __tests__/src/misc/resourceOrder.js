import ResourceTimeGridViewWrapper from "../lib/wrappers/ResourceTimeGridViewWrapper"
import ResourceTimelineViewWrapper from '../lib/wrappers/ResourceTimelineViewWrapper'

describe('resourceOrder', function() {

  describe('when in timeGrid view', function() {
    pushOptions({
      initialView: 'resourceTimeGridDay',
      resources: [
        { id: 'a', title: 'Auditorium A' },
        { id: 'b', title: 'Auditorium B' },
        { id: 'c', title: 'Auditorium C' },
        { id: 'd', title: 'Auditorium D' },
        { id: 'e', title: 'Auditorium E' },
        { id: 'f', title: 'Auditorium F' },
        { id: 'a2', title: 'Auditorium A2' },
        { id: 'b2', title: 'Auditorium B2' },
        { id: 'c2', title: 'Auditorium C2' },
        { id: 'd2', title: 'Auditorium D2' },
        { id: 'e2', title: 'Auditorium E2' },
        { id: 'f2', title: 'Auditorium F2' }
      ]
    })


    it('renders correct order when not defined and alpha collisions', function() {
      let calendar = initCalendar()
      let headerWrapper = new ResourceTimeGridViewWrapper(calendar).header

      expect(headerWrapper.getResourceIds()).toEqual([
        'a', 'b', 'c', 'd', 'e', 'f', 'a2', 'b2', 'c2', 'd2', 'e2', 'f2'
      ])
    })


    it('renders correct order when ordered by title', function() {
      let calendar = initCalendar({
        resourceOrder: 'title'
      })
      let headerWrapper = new ResourceTimeGridViewWrapper(calendar).header

      expect(headerWrapper.getResourceIds()).toEqual([
        'a', 'a2', 'b', 'b2', 'c', 'c2', 'd', 'd2', 'e', 'e2', 'f', 'f2'
      ])
    })

  })

  describe('when in timeline view', function() {
    pushOptions({
      initialView: 'resourceTimelineDay',
      resources: [
        { id: 'a', title: 'Auditorium A' },
        { id: 'b', title: 'Auditorium B' },
        { id: 'c', title: 'Auditorium C' },
        { id: 'd', title: 'Auditorium D' },
        { id: 'e', title: 'Auditorium E' },
        { id: 'f', title: 'Auditorium F' },
        { id: 'a2', title: 'Auditorium A2' },
        { id: 'b2', title: 'Auditorium B2' },
        { id: 'c2', title: 'Auditorium C2' },
        { id: 'd2', title: 'Auditorium D2' },
        { id: 'e2', title: 'Auditorium E2' },
        { id: 'f2', title: 'Auditorium F2' }
      ]
    })

    it('renders correct order when not defined and alpha collisions', function() {
      let calendar = initCalendar()
      let timelineGridWrapper = new ResourceTimelineViewWrapper(calendar).timelineGrid

      expect(timelineGridWrapper.getResourceIds()).toEqual([
        'a', 'b', 'c', 'd', 'e', 'f', 'a2', 'b2', 'c2', 'd2', 'e2', 'f2'
      ])
    })

    it('renders correct order when ordered by title', function() {
      let calendar = initCalendar({
        resourceOrder: 'title'
      })
      let timelineGridWrapper = new ResourceTimelineViewWrapper(calendar).timelineGrid

      expect(timelineGridWrapper.getResourceIds()).toEqual([
        'a', 'a2', 'b', 'b2', 'c', 'c2', 'd', 'd2', 'e', 'e2', 'f', 'f2'
      ])
    })

  })
})
