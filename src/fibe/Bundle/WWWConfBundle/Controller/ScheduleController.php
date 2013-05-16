<?php 
namespace fibe\Bundle\WWWConfBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
//On insere l'entity Event  de simple schedule
use IDCI\Bundle\SimpleScheduleBundle\Form\XPropertyType; 
use IDCI\Bundle\SimpleScheduleBundle\Form\EventType;
use IDCI\Bundle\SimpleScheduleBundle\Entity\XProperty; 
use IDCI\Bundle\SimpleScheduleBundle\Entity\Event; 
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
 * @Route("/getEvents", name="wwwconf_getevents")
 */
    public function getEventsAction(Request $request)
    {
    
	    $em = $this->getDoctrine()->getManager();
    
	    $getData = $request->query;
	    $methodParam = $getData->get('method', ''); 
	    $postData = $request->request->all();
	    
      $JSONArray ;
	    
	    if( $methodParam=="list"){
	        $date = strtotime( date('m/d/Y', strtotime($postData['showdate'])) ); 
          $week_start = date('m/d/Y H:i', strtotime('this week last monday', $date));
          $week_end = date('m/d/Y H:i', strtotime('this week next monday ', $date)); 
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
        $events = array(); 
        for ($i = 0; $i < count($eventsEntities); $i++) {
          echo "Cle : $i; Valeur : $eventsEntities[$i]";
          $event;
          $event[0] = $eventsEntities[$i]->getId();
          $event[1] = $eventsEntities[$i]->getSummary();
          $event[2] = $eventsEntities[$i]->getStartAt()->format('m/d/Y H:i');
          $date1 =  $eventsEntities[$i]->getStartAt() ;
          $date2 =  $eventsEntities[$i]->getEndAt() ; 
          $diff =  $date1->diff($date2) ; 
          $event[3] = $diff->format('%m/%d/%Y %H:%i');
          array_push($events, $event); 
        }
       $JSONArray['events'] = $events;
        
	    }else if( $methodParam=="add"){
	      
	    }else if( $methodParam=="update"){
	       
	    }else if( $methodParam=="remove"){
	      
	    }
	    
      $response = new Response(json_encode($JSONArray));
      $response->headers->set('Content-Type', 'application/json');
      return $response;
    }
    
    
}




