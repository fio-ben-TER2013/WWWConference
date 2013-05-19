<?php 
namespace fibe\Bundle\WWWConfBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
//On insere l'entity Event  de simple schedule

use IDCI\Bundle\SimpleScheduleBundle\Entity\Event;
use IDCI\Bundle\SimpleScheduleBundle\Entity\XProperty;
use IDCI\Bundle\SimpleScheduleBundle\Entity\CalendarEntityRelation;
use IDCI\Bundle\SimpleScheduleBundle\Form\EventType;
use IDCI\Bundle\SimpleScheduleBundle\Form\RecurChoiceType;
use IDCI\Bundle\SimpleScheduleBundle\Form\XPropertyType;
use IDCI\Bundle\SimpleScheduleBundle\Form\CalendarEntityRelationType;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;





//use fibe\Bundle\WWWConfBundle\Form\EventType; 
//On insere le controlleur de Event 
//use SimpleScheduleBundle\Controller
/**
 * Schedule Controller 
 *
 * @Route("/admin/schedule")
 */
class ScheduleController extends Controller
{

/**
 *  @Route("/", name="wwwconf_schedule")
 *  @Template()
 */
    public function scheduleAction()
    {
        return array();
    }
    

/**
 *   return all events contained in the given date week
 * @Route("/getEvents", name="wwwconf_getevents")
 */
    public function getEventsAction(Request $request)
    {
    
	    $em = $this->getDoctrine()->getManager();
    
	    $getData = $request->query;
	    $methodParam = $getData->get('method', ''); 
	    $postData = $request->request->all();
	    
      $JSONArray = array();
	    
	    if( $methodParam=="list"){
	        $date = strtotime( date('m/d/Y', strtotime($postData['showdate'])) ); 
	        
          $week_start = date('m/d/Y H:i', strtotime('this week last monday', $date));
          $week_end = date('m/d/Y H:i', strtotime('this week next monday ', $date)); 
              
	        if($postData['viewtype']=="month"){
              $week_start = date('m/d/Y H:i', strtotime('this month last monday', $date));
              $week_end = date('m/d/Y H:i', strtotime('this month next monday ', $date));
	        } 
	        $date = strtotime( date('m/d/Y', strtotime($postData['showdate'])) );  
          $JSONArray['start'] = $week_start;
          $JSONArray['end'] = $week_end;
          $JSONArray['error'] = null;
          $JSONArray['issort'] = true;
          
          
          $eventsEntities =  $em->getRepository('IDCISimpleScheduleBundle:Event')
                        ->createQueryBuilder('e')
                        ->where('e.startAt > :weekStart')
                        ->andWhere('e.endAt < :weekEnd')
                        ->setParameters(array(
                          'weekStart'  => date('Y-m-d H:i', strtotime( $week_start)) ,
                          'weekEnd'    => date('Y-m-d H:i', strtotime( $week_end )),
                        )) 
                        ->getQuery()
                        ->getResult();
        $JSONArray['events'] = array();
        for ($i = 0; $i < count($eventsEntities); $i++) {
          
          $start =  $eventsEntities[$i]->getStartAt() ; 
          $end =  $eventsEntities[$i]->getEndAt() ; 
          $duration =   $end->diff($start) ; 
          $duration =  ($duration->y * 365 * 24 * 60 * 60) + 
                       ($duration->m * 30 * 24 * 60 * 60) + 
                       ($duration->d * 24 * 60 * 60) + 
                       ($duration->h * 60 * 60) + 
                       ($duration->i * 60) + 
                       $duration->s;
          //echo $eventsEntities[$i]->getSummary().", ".$duration." .... ";
          $category = $eventsEntities[$i]->getCategories();
          $category = $category[0];  
          $JSONArray['events'][] = array(
            $eventsEntities[$i]->getId(),
            $eventsEntities[$i]->getSummary(),
            $start->format('m/d/Y H:i'),
            $end->format('m/d/Y H:i'),
            0,                                  // disable alarm clock icon
            $duration % 86400 == 86399 ? 1 : 0,                                  // all day event
            0,                                  // ??
            $category?$category->getId():null,                 // color
            1,                                  // editable
            $eventsEntities[$i]->getLocation()?$eventsEntities[$i]->getLocation()->getName():null, // location if exists
            null                                // $attends
          );
          
        }
        
	    }else if( $methodParam=="add"){
        
          $event= new Event();
          $startAt=new \DateTime($postData['start'], new \DateTimeZone(date_default_timezone_get()));
          $event->setStartAt($startAt );
          
          if($postData['isallday']=="true"){
              $endAt = new \DateTime($postData['end'], new \DateTimeZone(date_default_timezone_get()));   
              $event->setEndAt($endAt->add(new \DateInterval('PT23H59M59S'))); 
          }
          else {
              $event->setEndAt(new \DateTime($postData['end'], new \DateTimeZone(date_default_timezone_get()))); 
           }
          
          $event->setSummary($postData['title']);
          $em->persist($event);
          $em->flush();  
          
          $JSONArray['Data'] = $event->getId();
          $JSONArray['IsSuccess'] = true;
          $JSONArray['Msg'] = "add success";
          
          
	    }else if( $methodParam=="update"){ 
	        
          $event = $em->getRepository('IDCISimpleScheduleBundle:Event')->find($postData['calendarId']);
          $startAt = new \DateTime($postData['CalendarStartTime'], new \DateTimeZone(date_default_timezone_get()));
          $endAt =new \DateTime($postData['CalendarEndTime'], new \DateTimeZone(date_default_timezone_get())) ;
          $event->setStartAt( $startAt );
          $event->setEndAt( $endAt );
          $em->persist($event);
          $em->flush();  
          $JSONArray['IsSuccess'] = true;
          $JSONArray['Msg'] = "Succefully";
	    }
	    
      $response = new Response(json_encode($JSONArray));
      $response->headers->set('Content-Type', 'application/json');
      return $response;
    }
    

    /**
     * @Route("/editEvents", name="wwwconf_editEvent")
     * @Template()
     */
     
    public function scheduleEditAction(Request $request)
    {
	    $getData = $request->query;
        $id = $getData->get('id', ''); 
        
        $em = $this->getDoctrine()->getManager();
        $entity = $em->getRepository('IDCISimpleScheduleBundle:Event')->find($id);

        if (!$entity) {
            throw $this->createNotFoundException('Unable to find Event entity.');
        }

        $form = $this->createForm(new EventType(), $entity);
        $deleteForm =  $this->createFormBuilder(array('id' => $id))
                            ->add('id', 'hidden')
                            ->getForm()
                        ;

        $xproperty = new XProperty();
        $xproperty->setCalendarEntity($entity);
        $xpropertyForm = $this->createForm(new XPropertyType(), $xproperty);

        $relation = new CalendarEntityRelation();
        $relation->setCalendarEntity($entity);
        $relationForm = $this->createForm(new CalendarEntityRelationType($entity), $relation);

        return array(
            'entity'            => $entity,
            'formEvent'         => $form->createView(),
            'delete_form'       => $deleteForm->createView(),
            'xproperty_form'    => $xpropertyForm->createView(),
            'relation_form'     => $relationForm->createView()
        );
      
    }
    
     
    /**
     * @Route("/{id}/updateEvents", name="wwwconf_updateEvent") 
     */
     
    public function scheduleUpdateAction(Request $request,$id)
    {
    
      $JSONArray = array();
	     
          
        $em = $this->getDoctrine()->getManager();
        $entity = $em->getRepository('IDCISimpleScheduleBundle:Event')->find($id);

        if (!$entity) {
          $JSONArray['IsSuccess'] = false;
          $JSONArray['Msg'] = "entity not found"; 
          $response = new Response(json_encode($JSONArray));
          $response->headers->set('Content-Type', 'application/json');
          return $response;
        }
        
        $JSONArray['Data'] = $id;
 
        $editForm = $this->createForm(new EventType(), $entity);
        $editForm->bind($request); 
        if ($editForm->isValid()) { 
            $em->persist($entity);
            $em->flush();
 
          $JSONArray['IsSuccess'] = true;
          $JSONArray['Msg'] = "update success"; 
          
          
        }else{
          $JSONArray['IsSuccess'] = false;
          $JSONArray['Msg'] = "update failed"; 
        
        }
        $response = new Response(json_encode($JSONArray));
        $response->headers->set('Content-Type', 'application/json');
        return $response;

      
    }
    
     
}




